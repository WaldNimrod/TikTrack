/**
 * Smart Page Initialization Configurations - Enhanced TikTrack
 * ============================================================
 *
 * קונפיגורציות אתחול חכמות לעמודים שונים
 * עם תמיכה במערכת החדשה ותאימות לאחור
 *
 * @version 2.0.0
 * @lastUpdated October 2025
 * @author TikTrack Development Team
 */

// ===== SMART PAGE CONFIGURATIONS =====

const SMART_PAGE_CONFIGS = {
    // Main Pages
    'index': {
        name: 'Dashboard',
        template: 'dashboard-page',
        packages: ['base', 'crud', 'charts', 'advanced-notifications'],
        systems: ['ChartManagementSystem', 'MonitoringSystem'],
        features: ['data-visualization', 'real-time-updates', 'interactive-charts'],
        customInitializers: [
            async (pageConfig) => {
                console.log('📊 Initializing Dashboard...');
                
                // Use the new unified initialization function
                if (typeof window.initializeIndexPage === 'function') {
                    await window.initializeIndexPage();
                } else {
                    // Fallback to old method
                    if (typeof window.initializeCharts === 'function') {
                        await window.initializeCharts();
                    }
                    
                    if (typeof window.loadDashboardData === 'function') {
                        await window.loadDashboardData();
                    }
                }
            }
        ],
        customScripts: ['scripts/dashboard-specific.js'],
        // Legacy support
        requiresFilters: true,
        requiresValidation: false,
        requiresTables: true
    },
    
    'preferences': {
        name: 'Preferences',
        template: 'settings-page',
        packages: ['base', 'preferences', 'ui-advanced'],
        systems: ['PreferencesSystem', 'ButtonSystem', 'ColorSchemeSystem'],
        features: ['preferences-management', 'settings-validation', 'theme-controls'],
        customInitializers: [
            async (pageConfig) => {
                console.log('⚙️ Initializing Preferences...');
                
                if (typeof window.initializePreferences === 'function') {
                    await window.initializePreferences();
                } else if (typeof window.loadAllPreferences === 'function') {
                    await window.loadAllPreferences();
                }
                
                if (typeof window.loadDefaultColors === 'function') {
                    window.loadDefaultColors();
                }
            }
        ],
        customScripts: ['scripts/preferences-specific.js'],
        // Legacy support
        requiresFilters: false,
        requiresValidation: true,
        requiresTables: false
    },
    
    // Trading Pages
    'trades': {
        name: 'Trades',
        template: 'crud-page',
        packages: ['base', 'crud', 'filters'],
        systems: ['TableSystem', 'DataUtils', 'PaginationSystem', 'HeaderFilters'],
        features: ['data-loading', 'data-editing', 'data-deletion', 'filtering'],
        customInitializers: [
            async (pageConfig) => {
                console.log('📈 Initializing Trades...');
                
                if (typeof window.initializeTradesPage === 'function') {
                    await window.initializeTradesPage();
                } else {
                    if (typeof window.loadTradesData === 'function') {
                        await window.loadTradesData();
                    }
                }
            },
            async (pageConfig) => {
                console.log('🔧 Initializing Trades Conditions System...');
                
                if (typeof window.initializeTradeConditionsSystem === 'function') {
                    window.initializeTradeConditionsSystem();
                } else {
                    console.warn('⚠️ Trades conditions system not available');
                }
            }
        ],
        customScripts: ['scripts/trades-specific.js'],
        // Legacy support
        requiresFilters: true,
        requiresValidation: true,
        requiresTables: true
    },
    
    'executions': {
        name: 'Executions',
        template: 'crud-page',
        packages: ['base', 'crud', 'filters'],
        systems: ['TableSystem', 'DataUtils', 'PaginationSystem'],
        features: ['data-loading', 'data-editing', 'filtering'],
        customInitializers: [
            async (pageConfig) => {
                console.log('⚡ Initializing Executions...');
                
                if (typeof window.loadExecutionsData === 'function') {
                    await window.loadExecutionsData();
                }
            }
        ],
        customScripts: ['scripts/executions-specific.js'],
        // Legacy support
        requiresFilters: true,
        requiresValidation: false,
        requiresTables: true
    },
    
    'trade_plans': {
        name: 'Trade Plans',
        template: 'crud-page',
        packages: ['base', 'crud', 'filters'],
        systems: ['TableSystem', 'DataUtils', 'PaginationSystem', 'HeaderFilters'],
        features: ['data-loading', 'data-editing', 'data-deletion', 'filtering'],
        customInitializers: [
            async (pageConfig) => {
                console.log('📋 Initializing Trade Plans...');
                
                if (typeof window.initializeTradePlansPage === 'function') {
                    await window.initializeTradePlansPage();
                } else {
                    if (typeof window.loadTradePlansData === 'function') {
                        await window.loadTradePlansData();
                    }
                }
            },
            async (pageConfig) => {
                console.log('🔧 Initializing Trade Plans Conditions System...');
                
                if (typeof window.initializeTradePlanConditionsSystem === 'function') {
                    window.initializeTradePlanConditionsSystem();
                } else {
                    console.warn('⚠️ Trade plans conditions system not available');
                }
            }
        ],
        customScripts: ['scripts/trade-plans-specific.js'],
        // Legacy support
        requiresFilters: true,
        requiresValidation: true,
        requiresTables: true
    },
    
    'alerts': {
        name: 'Alerts',
        template: 'crud-page',
        packages: ['base', 'crud', 'filters', 'advanced-notifications'],
        systems: ['TableSystem', 'DataUtils', 'PaginationSystem', 'NotificationCategoryDetector'],
        features: ['data-loading', 'data-editing', 'data-deletion', 'filtering', 'advanced-notifications'],
        customInitializers: [
            async (pageConfig) => {
                console.log('🔔 Initializing Alerts...');
                
                if (typeof window.loadAlertsData === 'function') {
                    await window.loadAlertsData();
                }
            },
            async (pageConfig) => {
                console.log('🔧 Initializing Alerts Conditions Integration...');
                
                if (typeof window.initializeAlertModalTabs === 'function') {
                    window.initializeAlertModalTabs();
                } else {
                    console.warn('⚠️ Alert modal tabs system not available');
                }
            }
        ],
        customScripts: ['scripts/alerts-specific.js'],
        // Legacy support
        requiresFilters: true,
        requiresValidation: true,
        requiresTables: true
    },
    
    'conditions_test': {
        name: 'Conditions Test',
        template: 'simple-page',
        packages: ['base'],
        systems: [],
        features: [],
        customInitializers: [
            async (pageConfig) => {
                console.log('🔧 Initializing Conditions Test Page...');
                
                if (typeof window.initializeConditionsTestPage === 'function') {
                    await window.initializeConditionsTestPage();
                } else {
                    console.log('🔧 initializeConditionsTestPage function not found!');
                }
            }
        ],
        customScripts: ['scripts/conditions-test-specific.js'],
        // Legacy support
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false
    },
    
    'conditions-test': {
        name: 'Conditions Test',
        template: 'simple-page',
        packages: ['base'],
        systems: [],
        features: [],
        customInitializers: [
            async (pageConfig) => {
                console.log('🔧 Initializing Conditions Test Page...');
                
                if (typeof window.initializeConditionsTestPage === 'function') {
                    await window.initializeConditionsTestPage();
                } else {
                    console.log('🔧 initializeConditionsTestPage function not found!');
                }
            }
        ],
        customScripts: ['scripts/conditions-test-specific.js'],
        // Legacy support
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false
    },
    
    // Account Management
    'trading_accounts': {
        name: 'Trading Accounts',
        template: 'crud-page',
        packages: ['base', 'crud', 'filters'],
        systems: ['TableSystem', 'DataUtils', 'PaginationSystem', 'HeaderFilters'],
        features: ['data-loading', 'data-editing', 'data-deletion', 'filtering'],
        customInitializers: [
            async (pageConfig) => {
                console.log('🏦 Initializing Trading Accounts...');
                
                if (typeof window.loadTradingAccountsDataForTradingAccountsPage === 'function') {
                    await window.loadTradingAccountsDataForTradingAccountsPage();
                } else if (typeof window.loadAccountsData === 'function') {
                    await window.loadAccountsData();
                } else {
                    console.log('⚠️ No suitable function found for loading trading accounts data');
                }
            }
        ],
        customScripts: ['scripts/trading-accounts-specific.js'],
        // Legacy support
        requiresFilters: true,
        requiresValidation: true,
        requiresTables: true
    },
    
    'cash_flows': {
        name: 'Cash Flows',
        template: 'crud-page',
        packages: ['base', 'crud', 'filters'],
        systems: ['TableSystem', 'DataUtils', 'PaginationSystem'],
        features: ['data-loading', 'data-editing', 'filtering'],
        customInitializers: [
            async (pageConfig) => {
                console.log('💰 Initializing Cash Flows...');
                
                if (typeof window.loadCashFlowsData === 'function') {
                    await window.loadCashFlowsData();
                }
            }
        ],
        customScripts: ['scripts/cash-flows-specific.js'],
        // Legacy support
        requiresFilters: true,
        requiresValidation: false,
        requiresTables: true
    },
    
    // Data Management
    'tickers': {
        name: 'Tickers',
        template: 'crud-page',
        packages: ['base', 'crud', 'filters'],
        systems: ['TableSystem', 'DataUtils', 'PaginationSystem'],
        features: ['data-loading', 'data-editing', 'filtering'],
        customInitializers: [
            async (pageConfig) => {
                console.log('📊 Initializing Tickers...');
                
                if (typeof window.loadTickersData === 'function') {
                    await window.loadTickersData();
                }
            }
        ],
        customScripts: ['scripts/tickers-specific.js'],
        // Legacy support
        requiresFilters: true,
        requiresValidation: false,
        requiresTables: true
    },
    
    'notes': {
        name: 'Notes',
        template: 'simple-page',
        packages: ['base'],
        systems: [],
        features: [],
        customInitializers: [
            async (pageConfig) => {
                console.log('📝 Initializing Notes...');
                
                if (typeof window.loadNotesData === 'function') {
                    await window.loadNotesData();
                }
            }
        ],
        customScripts: ['scripts/notes-specific.js'],
        // Legacy support
        requiresFilters: false,
        requiresValidation: true,
        requiresTables: false
    },
    
    // Development Tools
    'system-management': {
        name: 'System Management',
        template: 'dev-tools-page',
        packages: ['base', 'crud', 'advanced-notifications', 'ui-advanced'],
        systems: ['TableSystem', 'NotificationCategoryDetector', 'ButtonSystem'],
        features: ['system-monitoring', 'debug-tools', 'performance-metrics'],
        customInitializers: [
            async (pageConfig) => {
                console.log('🔧 Initializing System Management...');
                
                if (typeof window.loadSystemInfo === 'function') {
                    await window.loadSystemInfo();
                }
                
                if (window.UnifiedLogAPI && !window.UnifiedLogAPI.initialized) {
                    try {
                        await window.UnifiedLogAPI.initialize();
                        console.log('✅ Unified Log System initialized for System Management');
                    } catch (error) {
                        console.warn('⚠️ Failed to initialize Unified Log System:', error);
                    }
                }
            }
        ],
        customScripts: ['scripts/system-management-specific.js'],
        // Legacy support
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false
    },
    
    'server-monitor': {
        name: 'Server Monitor',
        template: 'dev-tools-page',
        packages: ['base', 'monitoring', 'advanced-notifications'],
        systems: ['MonitoringSystem', 'NotificationCategoryDetector'],
        features: ['system-monitoring', 'performance-metrics'],
        customInitializers: [
            async (pageConfig) => {
                console.log('🔧 Initializing Server Monitor...');
                
                if (window.serverMonitor) {
                    console.log('✅ Server Monitor already initialized');
                } else {
                    console.log('⚠️ Server Monitor not available');
                }
                
                console.log('✅ Server Monitor initialization completed');
            }
        ],
        customScripts: ['scripts/server-monitor-specific.js'],
        // Legacy support
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false
    },
    
    'crud-testing-dashboard': {
        name: 'CRUD Testing',
        template: 'dev-tools-page',
        packages: ['base', 'crud', 'filters'],
        systems: ['TableSystem', 'DataUtils', 'PaginationSystem'],
        features: ['data-loading', 'data-editing', 'filtering'],
        customInitializers: [
            async (pageConfig) => {
                console.log('🧪 Initializing CRUD Testing...');
                
                if (typeof window.initializeCRUDTesting === 'function') {
                    await window.initializeCRUDTesting();
                }
            }
        ],
        customScripts: ['scripts/crud-testing-specific.js'],
        // Legacy support
        requiresFilters: false,
        requiresValidation: true,
        requiresTables: true
    },
    
    'external-data-dashboard': {
        name: 'External Data',
        template: 'dashboard-page',
        packages: ['base', 'crud', 'charts', 'advanced-notifications'],
        systems: ['TableSystem', 'ChartSystem', 'NotificationCategoryDetector'],
        features: ['data-visualization', 'real-time-updates', 'interactive-charts'],
        customInitializers: [
            async (pageConfig) => {
                console.log('🌐 Initializing External Data...');
                
                if (typeof window.loadExternalData === 'function') {
                    await window.loadExternalData();
                }
                
                if (typeof ExternalDataDashboard !== 'undefined' && !window.externalDataDashboard) {
                    try {
                        window.externalDataDashboard = new ExternalDataDashboard();
                        window.externalDataDashboard.init();
                        console.log('✅ External Data Dashboard initialized');
                    } catch (error) {
                        console.error('❌ Failed to initialize External Data Dashboard:', error);
                    }
                }
                
                if (window.UnifiedLogAPI && !window.UnifiedLogAPI.initialized) {
                    try {
                        await window.UnifiedLogAPI.initialize();
                        console.log('✅ Unified Log System initialized for External Data Dashboard');
                    } catch (error) {
                        console.warn('⚠️ Failed to initialize Unified Log System:', error);
                    }
                }
                
                // Define global functions for button onclick handlers
                this.defineExternalDataFunctions();
                
                // Load external data log after page initialization
                setTimeout(async () => {
                    try {
                        if (typeof window.loadExternalDataLog === 'function') {
                            await window.loadExternalDataLog();
                            console.log('✅ External data log loaded after page initialization');
                        }
                    } catch (error) {
                        console.error('❌ Failed to load external data log:', error);
                    }
                }, 1000);
            }
        ],
        customScripts: ['scripts/external-data-specific.js'],
        // Legacy support
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: true
    },
    
    'linter-realtime-monitor': {
        name: 'Linter Monitor',
        template: 'dev-tools-page',
        packages: ['base', 'monitoring', 'advanced-notifications'],
        systems: ['MonitoringSystem', 'NotificationCategoryDetector'],
        features: ['system-monitoring', 'debug-tools'],
        customInitializers: [
            async (pageConfig) => {
                console.log('🔍 Initializing Linter Monitor...');
                
                if (typeof window.startLinterMonitoring === 'function') {
                    await window.startLinterMonitoring();
                }
            }
        ],
        customScripts: ['scripts/linter-monitor-specific.js'],
        // Legacy support
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false
    },
    
    'notifications-center': {
        name: 'Notifications Center',
        template: 'simple-page',
        packages: ['base'],
        systems: [],
        features: [],
        customInitializers: [
            async (pageConfig) => {
                console.log('📬 Initializing Notifications Center...');
                
                if (typeof window.initializeNotificationsCenter === 'function') {
                    await window.initializeNotificationsCenter();
                } else if (typeof window.loadNotifications === 'function') {
                    await window.loadNotifications();
                }
            }
        ],
        customScripts: ['scripts/notifications-center-specific.js'],
        // Legacy support
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false
    },
    
    'notifications-center.html': {
        name: 'Notifications Center HTML',
        template: 'simple-page',
        packages: ['base'],
        systems: [],
        features: [],
        customInitializers: [
            async (pageConfig) => {
                console.log('📬 Initializing Notifications Center HTML...');
                
                if (typeof window.initializeNotificationsCenter === 'function') {
                    await window.initializeNotificationsCenter();
                } else if (typeof window.loadNotifications === 'function') {
                    await window.loadNotifications();
                }
                
                if (window.UnifiedLogAPI) {
                    console.log('📊 Initializing Unified Log System for notifications center...');
                    try {
                        await window.UnifiedLogAPI.initialize();
                        
                        const logContainer = document.getElementById('notification-log-container');
                        if (logContainer && !logContainer.querySelector('.unified-log-display')) {
                            console.log('🔄 Loading notification log in container...');
                            await window.showNotificationLog('notification-log-container', {
                                displayConfig: 'default',
                                autoRefresh: true,
                                refreshInterval: 10000
                            });
                        }
                    } catch (error) {
                        console.warn('⚠️ Failed to initialize Unified Log System:', error);
                    }
                }
            }
        ],
        customScripts: ['scripts/notifications-center-specific.js'],
        // Legacy support
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false
    },
    
    'unified-logs-demo.html': {
        name: 'Unified Logs Demo',
        template: 'simple-page',
        packages: ['base'],
        systems: [],
        features: [],
        customInitializers: [
            async (pageConfig) => {
                console.log('📊 Initializing Unified Logs Demo...');
                
                if (window.UnifiedLogAPI) {
                    try {
                        await window.UnifiedLogAPI.initialize();
                        console.log('✅ Unified Log System initialized for demo');
                    } catch (error) {
                        console.warn('⚠️ Failed to initialize Unified Log System for demo:', error);
                    }
                }
            }
        ],
        customScripts: ['scripts/unified-logs-demo-specific.js'],
        // Legacy support
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false
    },
    
    'db_display': {
        name: 'Database Display',
        template: 'crud-page',
        packages: ['base', 'crud'],
        systems: ['TableSystem', 'DataUtils'],
        features: ['data-loading', 'data-editing'],
        customInitializers: [
            async (pageConfig) => {
                console.log('🗄️ Initializing Database Display...');
                
                if (typeof window.loadDatabaseInfo === 'function') {
                    await window.loadDatabaseInfo();
                }
            }
        ],
        customScripts: ['scripts/db-display-specific.js'],
        // Legacy support
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: true
    },
    
    'research': {
        name: 'Research',
        template: 'simple-page',
        packages: ['base', 'filters'],
        systems: ['HeaderFilters'],
        features: ['filtering'],
        customInitializers: [
            async (pageConfig) => {
                console.log('🔬 Initializing Research...');
                
                if (typeof window.initializeResearchTools === 'function') {
                    await window.initializeResearchTools();
                }
            }
        ],
        customScripts: ['scripts/research-specific.js'],
        // Legacy support
        requiresFilters: true,
        requiresValidation: false,
        requiresTables: false
    },
    
    'cache-test': {
        name: 'Cache Test',
        template: 'simple-page',
        packages: ['base'],
        systems: [],
        features: [],
        customInitializers: [
            async (pageConfig) => {
                console.log('🧪 Initializing Cache Test...');
                
                if (typeof window.initializeCacheTest === 'function') {
                    console.log('✅ Calling initializeCacheTest...');
                    try {
                        await window.initializeCacheTest();
                        console.log('✅ initializeCacheTest completed successfully');
                    } catch (error) {
                        console.error('❌ Error in initializeCacheTest:', error);
                    }
                } else {
                    console.error('❌ initializeCacheTest function not found!');
                }
            }
        ],
        customScripts: ['scripts/cache-test-specific.js'],
        // Legacy support
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false
    }
};

// ===== ENHANCED CONFIGURATION HELPER FUNCTIONS =====

/**
 * Get smart page configuration by page name
 * @param {string} pageName - Page name
 * @returns {Object} Smart page configuration
 */
window.getSmartPageConfig = function(pageName) {
    return SMART_PAGE_CONFIGS[pageName] || {
        name: pageName,
        template: 'simple-page',
        packages: ['base'],
        systems: [],
        features: [],
        customInitializers: [],
        customScripts: [],
        // Legacy support
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false
    };
};

/**
 * Get all available smart page configurations
 * @returns {Object} All smart page configurations
 */
window.getAllSmartPageConfigs = function() {
    return SMART_PAGE_CONFIGS;
};

/**
 * Check if page requires specific system (enhanced)
 * @param {string} pageName - Page name
 * @param {string} system - System name
 * @returns {boolean} Whether page requires the system
 */
window.smartPageRequiresSystem = function(pageName, system) {
    const config = window.getSmartPageConfig(pageName);
    
    // Check new system format
    if (config.systems && config.systems.includes(system)) {
        return true;
    }
    
    // Check packages
    if (config.packages) {
        for (const packageName of config.packages) {
            if (window.SYSTEM_PACKAGES && window.SYSTEM_PACKAGES[packageName]) {
                const pkg = window.SYSTEM_PACKAGES[packageName];
                if (pkg.systems && pkg.systems.includes(system)) {
                    return true;
                }
            }
        }
    }
    
    // Fallback to legacy format
    switch (system) {
        case 'filters':
            return config.requiresFilters;
        case 'validation':
            return config.requiresValidation;
        case 'tables':
            return config.requiresTables;
        default:
            return false;
    }
};

/**
 * Get smart page initialization summary
 * @param {string} pageName - Page name
 * @returns {Object} Enhanced initialization summary
 */
window.getSmartPageInitSummary = function(pageName) {
    const config = window.getSmartPageConfig(pageName);
    
    return {
        name: config.name,
        template: config.template,
        packages: config.packages || [],
        systems: config.systems || [],
        features: config.features || [],
        customInitializers: config.customInitializers.length,
        customScripts: config.customScripts || [],
        // Legacy support
        legacySystems: {
            filters: config.requiresFilters,
            validation: config.requiresValidation,
            tables: config.requiresTables
        },
        totalSystems: (config.systems ? config.systems.length : 0) + 
                     (config.packages ? config.packages.length : 0) + 
                     config.customInitializers.length
    };
};

/**
 * Get scripts for smart page configuration
 * @param {string} pageName - Page name
 * @returns {Object} Scripts configuration
 */
window.getSmartPageScripts = function(pageName) {
    const config = window.getSmartPageConfig(pageName);
    const scripts = {
        required: [],
        optional: [],
        all: []
    };
    
    // Add package scripts
    if (config.packages && window.pageTemplates) {
        for (const packageName of config.packages) {
            const packageScripts = window.pageTemplates.getScriptsForPackage(packageName);
            if (packageScripts) {
                scripts.required.push(...packageScripts.required || []);
                scripts.optional.push(...packageScripts.optional || []);
            }
        }
    }
    
    // Add custom scripts
    if (config.customScripts) {
        scripts.required.push(...config.customScripts);
    }
    
    // Remove duplicates
    scripts.required = [...new Set(scripts.required)];
    scripts.optional = [...new Set(scripts.optional)];
    scripts.all = [...new Set([...scripts.required, ...scripts.optional])];
    
    return scripts;
};

/**
 * Get CSS files for smart page configuration
 * @param {string} pageName - Page name
 * @returns {Array} CSS files
 */
window.getSmartPageCSSFiles = function(pageName) {
    const config = window.getSmartPageConfig(pageName);
    const cssFiles = [];
    
    // Add template CSS files
    if (config.template && window.pageTemplates) {
        const templateCSS = window.pageTemplates.getCSSFilesForTemplate(config.template);
        if (templateCSS) {
            cssFiles.push(...templateCSS);
        }
    }
    
    // Add package CSS files
    if (config.packages && window.pageTemplates) {
        for (const packageName of config.packages) {
            const packageCSS = window.pageTemplates.getCSSFilesForPackage(packageName);
            if (packageCSS) {
                cssFiles.push(...packageCSS);
            }
        }
    }
    
    return [...new Set(cssFiles)];
};

/**
 * Validate smart page configuration
 * @param {string} pageName - Page name
 * @returns {Object} Validation result
 */
window.validateSmartPageConfig = function(pageName) {
    const config = window.getSmartPageConfig(pageName);
    const errors = [];
    const warnings = [];
    
    // Check required fields
    if (!config.name) {
        errors.push('Page name is required');
    }
    
    if (!config.template) {
        errors.push('Template is required');
    }
    
    if (!config.packages || !Array.isArray(config.packages)) {
        errors.push('Packages must be an array');
    }
    
    if (!config.systems || !Array.isArray(config.systems)) {
        errors.push('Systems must be an array');
    }
    
    if (!config.features || !Array.isArray(config.features)) {
        errors.push('Features must be an array');
    }
    
    if (!config.customInitializers || !Array.isArray(config.customInitializers)) {
        errors.push('Custom initializers must be an array');
    }
    
    // Check template validity
    if (config.template && window.pageTemplates) {
        const template = window.pageTemplates.getTemplate(config.template);
        if (!template) {
            errors.push(`Template not found: ${config.template}`);
        }
    }
    
    // Check package validity
    if (config.packages && window.SYSTEM_PACKAGES) {
        for (const packageName of config.packages) {
            if (!window.SYSTEM_PACKAGES[packageName]) {
                errors.push(`Package not found: ${packageName}`);
            }
        }
    }
    
    // Check system validity
    if (config.systems && window.SYSTEM_DEPENDENCIES) {
        for (const systemName of config.systems) {
            if (!window.SYSTEM_DEPENDENCIES[systemName]) {
                warnings.push(`System not found in dependencies: ${systemName}`);
            }
        }
    }
    
    return {
        valid: errors.length === 0,
        errors: errors,
        warnings: warnings
    };
};

/**
 * Migrate legacy page configuration to smart format
 * @param {string} pageName - Page name
 * @param {Object} legacyConfig - Legacy configuration
 * @returns {Object} Smart configuration
 */
window.migrateLegacyPageConfig = function(pageName, legacyConfig) {
    const smartConfig = {
        name: legacyConfig.name || pageName,
        template: 'simple-page', // Default template
        packages: ['base'], // Default package
        systems: [],
        features: [],
        customInitializers: legacyConfig.customInitializers || [],
        customScripts: [],
        // Legacy support
        requiresFilters: legacyConfig.requiresFilters || false,
        requiresValidation: legacyConfig.requiresValidation || false,
        requiresTables: legacyConfig.requiresTables || false
    };
    
    // Determine template based on legacy configuration
    if (legacyConfig.requiresTables && legacyConfig.requiresFilters) {
        smartConfig.template = 'crud-page';
        smartConfig.packages = ['base', 'crud', 'filters'];
        smartConfig.systems = ['TableSystem', 'DataUtils', 'PaginationSystem', 'HeaderFilters'];
        smartConfig.features = ['data-loading', 'data-editing', 'filtering'];
    } else if (legacyConfig.requiresTables) {
        smartConfig.template = 'crud-page';
        smartConfig.packages = ['base', 'crud'];
        smartConfig.systems = ['TableSystem', 'DataUtils', 'PaginationSystem'];
        smartConfig.features = ['data-loading', 'data-editing'];
    } else if (legacyConfig.requiresFilters) {
        smartConfig.template = 'simple-page';
        smartConfig.packages = ['base', 'filters'];
        smartConfig.systems = ['HeaderFilters'];
        smartConfig.features = ['filtering'];
    }
    
    return smartConfig;
};

// ===== BACKWARD COMPATIBILITY =====

/**
 * Legacy function for backward compatibility
 * @param {string} pageName - Page name
 * @returns {Object} Page configuration
 */
window.getPageConfig = function(pageName) {
    // Try smart config first
    const smartConfig = window.getSmartPageConfig(pageName);
    
    // If smart config exists, return legacy format
    if (smartConfig && smartConfig.name) {
        return {
            name: smartConfig.name,
            requiresFilters: smartConfig.requiresFilters || false,
            requiresValidation: smartConfig.requiresValidation || false,
            requiresTables: smartConfig.requiresTables || false,
            customInitializers: smartConfig.customInitializers || []
        };
    }
    
    // Fallback to legacy config
    if (window.PAGE_CONFIGS && window.PAGE_CONFIGS[pageName]) {
        return window.PAGE_CONFIGS[pageName];
    }
    
    // Default configuration
    return {
        name: pageName,
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: []
    };
};

/**
 * Legacy function for backward compatibility
 * @returns {Object} All page configurations
 */
window.getAllPageConfigs = function() {
    // Merge smart and legacy configs
    const allConfigs = {};
    
    // Add smart configs
    for (const [pageName, config] of Object.entries(SMART_PAGE_CONFIGS)) {
        allConfigs[pageName] = {
            name: config.name,
            requiresFilters: config.requiresFilters || false,
            requiresValidation: config.requiresValidation || false,
            requiresTables: config.requiresTables || false,
            customInitializers: config.customInitializers || []
        };
    }
    
    // Add legacy configs that don't exist in smart configs
    if (window.PAGE_CONFIGS) {
        for (const [pageName, config] of Object.entries(window.PAGE_CONFIGS)) {
            if (!allConfigs[pageName]) {
                allConfigs[pageName] = config;
            }
        }
    }
    
    return allConfigs;
};

/**
 * Legacy function for backward compatibility
 * @param {string} pageName - Page name
 * @param {string} system - System name
 * @returns {boolean} Whether page requires the system
 */
window.pageRequiresSystem = function(pageName, system) {
    return window.smartPageRequiresSystem(pageName, system);
};

/**
 * Legacy function for backward compatibility
 * @param {string} pageName - Page name
 * @returns {Object} Initialization summary
 */
window.getPageInitSummary = function(pageName) {
    const smartSummary = window.getSmartPageInitSummary(pageName);
    
    return {
        name: smartSummary.name,
        systems: smartSummary.legacySystems,
        customInitializers: smartSummary.customInitializers,
        totalSystems: smartSummary.totalSystems
    };
};

// ===== GLOBAL EXPORT =====

// ===== SMART PAGE CONFIGS CLASS =====

/**
 * Smart Page Configs Manager
 * מנהל קונפיגורציות עמודים חכמות
 */
class SmartPageConfigs {
    /**
     * Get configuration for a specific page
     * קבלת קונפיגורציה לעמוד ספציפי
     */
    static getConfig(pageName) {
        return SMART_PAGE_CONFIGS[pageName] || null;
    }

    /**
     * Validate page configuration
     * ולידציה של קונפיגורציית עמוד
     */
    static validateConfig(pageName) {
        const config = this.getConfig(pageName);
        if (!config) {
            return { valid: false, error: `Configuration not found for page: ${pageName}` };
        }

        const requiredFields = ['name', 'template', 'packages'];
        for (const field of requiredFields) {
            if (!config[field]) {
                return { valid: false, error: `Missing required field: ${field}` };
            }
        }

        return { valid: true };
    }

    /**
     * Get template for a page
     * קבלת תבנית לעמוד
     */
    static getTemplate(pageName) {
        const config = this.getConfig(pageName);
        return config ? config.template : null;
    }

    /**
     * Get all available page names
     * קבלת כל שמות העמודים הזמינים
     */
    static getAllPageNames() {
        return Object.keys(SMART_PAGE_CONFIGS);
    }

    /**
     * Get all configurations
     * קבלת כל הקונפיגורציות
     */
    static getAllConfigs() {
        return SMART_PAGE_CONFIGS;
    }
}

// Export to global scope
window.SMART_PAGE_CONFIGS = SMART_PAGE_CONFIGS;
window.SmartPageConfigs = SmartPageConfigs;

console.log('✅ Smart Page Initialization Configs loaded successfully');
