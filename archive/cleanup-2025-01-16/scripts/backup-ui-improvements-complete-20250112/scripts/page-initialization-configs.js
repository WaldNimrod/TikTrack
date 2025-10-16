/**
 * Page Initialization Configurations - TikTrack
 * =============================================
 *
 * קונפיגורציות אתחול ספציפיות לעמודים שונים
 * מאפשר גמישות מקסימלית עם תחזוקה קלה
 *
 * @version 1.0.0
 * @lastUpdated January 2025
 * @author TikTrack Development Team
 */

// ===== PAGE CONFIGURATIONS =====

const PAGE_CONFIGS = {
    // Main Pages
    'index': {
        name: 'Dashboard',
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            // Dashboard-specific initialization
            async (pageConfig) => {
                console.log('📊 Initializing Dashboard...');
                
                // Initialize dashboard (loads data and creates charts)
                if (typeof window.initializeIndexPage === 'function') {
                    await window.initializeIndexPage();
                }
            }
        ]
    },
    
    'preferences': {
        name: 'Preferences',
        requiresFilters: false,
        requiresValidation: true,
        requiresTables: false,
        customInitializers: [
            // Preferences-specific initialization
            async (pageConfig) => {
                console.log('⚙️ Initializing Preferences...');
                
                // טעינת חשבונות מסחר - חייב לבוא לפני loadAllPreferences!
                if (typeof window.loadAccountsForPreferences === 'function') {
                    console.log('🔄 Loading trading accounts for preferences...');
                    await window.loadAccountsForPreferences();
                }
                
                // טעינת כל ההעדפות
                if (typeof window.loadAllPreferences === 'function') {
                    await window.loadAllPreferences();
                }
            }
        ]
    },
    
    // Trading Pages
    'trades': {
        name: 'Trades',
        requiresFilters: true,
        requiresValidation: true,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                console.log('📈 Initializing Trades...');
                
                // Load trades data
                if (typeof window.loadTradesData === 'function') {
                    await window.loadTradesData();
                }
                
                // Setup trade-specific handlers
                if (typeof window.setupTradeHandlers === 'function') {
                    window.setupTradeHandlers();
                }
            }
        ]
    },
    
    'trade_plans': {
        name: 'Trade Plans',
        requiresFilters: true,
        requiresValidation: true,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                console.log('📋 Initializing Trade Plans...');
                
                // Load trade plans data
                if (typeof window.loadTradePlansData === 'function') {
                    await window.loadTradePlansData();
                }
                
                // Setup trade plan-specific handlers
                if (typeof window.setupTradePlanHandlers === 'function') {
                    window.setupTradePlanHandlers();
                }
            }
        ]
    },
    
    'executions': {
        name: 'Executions',
        requiresFilters: true,
        requiresValidation: false,
        requiresTables: true,
        requiresCommunication: true,
        requiresCharts: true,
        customInitializers: [
            async (pageConfig) => {
                console.log('⚡ Initializing Executions...');
                
                if (typeof window.loadExecutionsData === 'function') {
                    await window.loadExecutionsData();
                }
            }
        ]
    },
    
    'alerts': {
        name: 'Alerts',
        requiresFilters: true,
        requiresValidation: true,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                console.log('🔔 Initializing Alerts...');
                
                if (typeof window.loadAlertsData === 'function') {
                    await window.loadAlertsData();
                }
                
                if (typeof window.setupAlertHandlers === 'function') {
                    window.setupAlertHandlers();
                }
            }
        ]
    },
    
    // Account Management
    // REMOVED: Duplicate 'trading_accounts' - see line 213 for the correct implementation
    
    'cash_flows': {
        name: 'Cash Flows',
        requiresFilters: true,
        requiresValidation: false,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                console.log('💰 Initializing Cash Flows...');
                
                if (typeof window.initializeCashFlowsPage === 'function') {
                    await window.initializeCashFlowsPage();
                }
            }
        ]
    },
    
    // Data Management
    'tickers': {
        name: 'Tickers',
        requiresFilters: true,
        requiresValidation: false,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                console.log('📊 Initializing Tickers...');
                
                if (typeof window.loadTickersData === 'function') {
                    await window.loadTickersData();
                }
            }
        ]
    },
    
    'notes': {
        name: 'Notes',
        requiresFilters: false,
        requiresValidation: true,
        requiresTables: false,
        customInitializers: [
            async (pageConfig) => {
                console.log('📝 Initializing Notes...');
                
                if (typeof window.loadNotesData === 'function') {
                    await window.loadNotesData();
                }
            }
        ]
    },
    
    'trading_accounts': {
        name: 'Trading Accounts',
        requiresFilters: true,        // נדרש - פילטרים עובדים
        requiresValidation: true,     // נדרש - ולידציה של נתונים
        requiresTables: true,         // נדרש - טבלאות עובדות
        customInitializers: [
            async (pageConfig) => {
                console.log('💼 Initializing Trading Accounts...');
                
                // טעינת נתונים ועדכון UI פשוט
                if (window.tradingAccountsController) {
                    // הגדרת event listeners
                    if (typeof window.tradingAccountsController.setupEventListeners === 'function') {
                        window.tradingAccountsController.setupEventListeners();
                    }
                    
                    // טעינת נתונים
                    if (typeof window.tradingAccountsController.loadData === 'function') {
                        await window.tradingAccountsController.loadData();
                    }
                    
                    // עדכון UI
                    if (typeof window.tradingAccountsController.updateUI === 'function') {
                        window.tradingAccountsController.updateUI();
                    }
                    
                    console.log('✅ Trading Accounts initialized successfully');
                } else {
                    console.error('❌ tradingAccountsController not found');
                }
            }
        ]
    },
    
    // Development Tools
    'system-management': {
        name: 'System Management',
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        requiresUI: true,
        customInitializers: [
            async (pageConfig) => {
                console.log('🔧 Initializing System Management...');
                
                if (typeof window.loadSystemInfo === 'function') {
                    await window.loadSystemInfo();
                }
                
                // Initialize Unified Log System
                if (window.UnifiedLogAPI && !window.UnifiedLogAPI.initialized) {
                    try {
                        await window.UnifiedLogAPI.initialize();
                        console.log('✅ Unified Log System initialized for System Management');
                    } catch (error) {
                        console.warn('⚠️ Failed to initialize Unified Log System:', error);
                    }
                }
            }
        ]
    },
    
    'server-monitor': {
        name: 'Server Monitor',
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async (pageConfig) => {
                console.log('🔧 Initializing Server Monitor...');
                
                // Initialize server monitor if available
                if (window.serverMonitor) {
                    console.log('✅ Server Monitor already initialized');
                } else {
                    console.log('⚠️ Server Monitor not available');
                }
                
                console.log('✅ Server Monitor initialization completed');
            }
        ]
    },
    
    'constraints': {
        name: 'Constraints',
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                console.log('🔒 Initializing Constraints...');
                
                if (typeof window.initializeConstraints === 'function') {
                    window.initializeConstraints();
                }
            }
        ]
    },
    
    'css-management': {
        name: 'CSS Management',
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async (pageConfig) => {
                console.log('🎨 Initializing CSS Management...');
                
                if (typeof window.initializeCssManagement === 'function') {
                    window.initializeCssManagement();
                }
            }
        ]
    },
    
    'chart-management': {
        name: 'Chart Management',
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async (pageConfig) => {
                console.log('📊 Initializing Chart Management...');
                
                // Chart management initializes automatically via its own DOMContentLoaded
                // Just log that we're aware of it
                console.log('✅ Chart Management system ready');
            }
        ]
    },
    
    'js-map': {
        name: 'JavaScript Map',
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async (pageConfig) => {
                console.log('🗺️ Initializing JS Map...');
                
                if (typeof window.initializeJsMapPage === 'function') {
                    window.initializeJsMapPage();
                }
            }
        ]
    },
    
    'crud-testing-dashboard': {
        name: 'CRUD Testing',
        requiresFilters: false,
        requiresValidation: true,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                console.log('🧪 Initializing CRUD Testing...');
                
                if (typeof window.initializeCRUDTesting === 'function') {
                    await window.initializeCRUDTesting();
                }
            }
        ]
    },
    
    'external-data-dashboard': {
        name: 'External Data',
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                console.log('🌐 Initializing External Data...');
                
                // Check if ExternalDataDashboard class is available
                console.log('🔍 Checking ExternalDataDashboard availability:', {
                    ExternalDataDashboard: typeof ExternalDataDashboard,
                    windowExternalDataDashboard: typeof window.ExternalDataDashboard
                });
                
                if (typeof window.loadExternalData === 'function') {
                    await window.loadExternalData();
                }
                
                // Initialize External Data Dashboard
                if (typeof ExternalDataDashboard !== 'undefined' && !window.externalDataDashboard) {
                    try {
                        window.externalDataDashboard = new ExternalDataDashboard();
                        window.externalDataDashboard.init();
                        console.log('✅ External Data Dashboard initialized');
                    } catch (error) {
                        console.error('❌ Failed to initialize External Data Dashboard:', error);
                    }
                } else {
                    console.log('🔍 External Data Dashboard check:', {
                        ExternalDataDashboard: typeof ExternalDataDashboard,
                        externalDataDashboard: typeof window.externalDataDashboard
                    });
                }
                
                // Initialize Unified Log System
                if (window.UnifiedLogAPI && !window.UnifiedLogAPI.initialized) {
                    try {
                        await window.UnifiedLogAPI.initialize();
                        console.log('✅ Unified Log System initialized for External Data Dashboard');
                    } catch (error) {
                        console.warn('⚠️ Failed to initialize Unified Log System:', error);
                    }
                }
                
                // Define global functions for button onclick handlers
                console.log('🔧 Defining global functions for External Data Dashboard...');
                
                window.testProvider = function(providerId) {
                    // console.log('🧪 Testing provider:', providerId);
                    // Implementation for testing specific provider
                };

                window.toggleProvider = function(providerId) {
                    // console.log('🔄 Toggling provider:', providerId);
                    // Implementation for toggling provider status
                };

                window.refreshLogs = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.loadLogs();
                    }
                };

                window.saveSettings = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.saveSettings();
                    }
                };

                window.clearLogs = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.clearLogs();
                    }
                };

                window.analyzeData = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.analyzeData();
                    }
                };

                window.backupData = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.backupData();
                    }
                };

                window.optimizeCache = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.optimizeCache();
                    }
                };

                window.refreshProviders = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.loadProviders();
                    }
                };

                window.testAllProviders = function() {
                    console.log('🔔 testAllProviders called from global function');
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.testAllProviders();
                    } else {
                        console.error('❌ externalDataDashboard not available');
                    }
                };

                window.exportData = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.exportData();
                    }
                };

                window.resetSettings = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.resetSettings();
                    }
                };

                window.refreshGroupHistory = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.loadGroupRefreshHistory();
                    }
                };

                window.exportGroupHistory = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.exportGroupHistory();
                    }
                };

                window.validateData = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.validateData();
                    }
                };

                window.runUnitTests = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.runUnitTests();
                    }
                };

                window.testSpecificFunction = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.testSpecificFunction();
                    }
                };

                window.generateTestReport = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.generateTestReport();
                    }
                };

                window.startPerformanceMonitoring = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.startPerformanceMonitoring();
                    }
                };

                window.analyzeBottlenecks = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.analyzeBottlenecks();
                    }
                };

                window.stopPerformanceMonitoring = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.stopPerformanceMonitoring();
                    }
                };

                window.testAPIEndpoints = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.testAPIEndpoints();
                    }
                };

                window.testRateLimiting = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.testRateLimiting();
                    }
                };

                window.testErrorHandling = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.testErrorHandling();
                    }
                };

                window.refreshPerformanceCharts = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.refreshPerformanceCharts();
                    }
                };

                window.exportPerformanceData = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.exportPerformanceData();
                    }
                };

                window.refreshChart = function(chartId) {
                    if (window.externalDataDashboard) {
                        switch(chartId) {
                            case 'responseTimeChart':
                                window.externalDataDashboard.refreshPerformanceCharts();
                                break;
                            case 'dataQualityChart':
                                window.externalDataDashboard.refreshPerformanceCharts();
                                break;
                            case 'providerComparisonChart':
                                window.externalDataDashboard.refreshPerformanceCharts();
                                break;
                            case 'errorAnalysisChart':
                                window.externalDataDashboard.refreshPerformanceCharts();
                                break;
                            default:
                                console.warn(`Unknown chart ID: ${chartId}`);
                        }
                    }
                };
                
                console.log('✅ Global functions defined for External Data Dashboard');
                
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
                }, 1000); // Wait 1 second after page load
            }
        ]
    },
    
    'linter-realtime-monitor': {
        name: 'Linter Monitor',
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async (pageConfig) => {
                console.log('🔍 Initializing Linter Monitor...');
                
                if (typeof window.startLinterMonitoring === 'function') {
                    await window.startLinterMonitoring();
                }
            }
        ]
    },
    
    'notifications-center': {
        name: 'Notifications Center',
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async (pageConfig) => {
                console.log('📬 Initializing Notifications Center...');
                
                if (typeof window.initializeNotificationsCenter === 'function') {
                    await window.initializeNotificationsCenter();
                } else if (typeof window.loadNotifications === 'function') {
                    await window.loadNotifications();
                }
            }
        ]
    },
    'notifications-center.html': {
        name: 'Notifications Center HTML',
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async (pageConfig) => {
                console.log('📬 Initializing Notifications Center HTML...');
                
                if (typeof window.initializeNotificationsCenter === 'function') {
                    await window.initializeNotificationsCenter();
                } else if (typeof window.loadNotifications === 'function') {
                    await window.loadNotifications();
                }
                
                // Initialize Unified Log System if available
                if (window.UnifiedLogAPI) {
                    console.log('📊 Initializing Unified Log System for notifications center...');
                    try {
                        await window.UnifiedLogAPI.initialize();
                        
                        // Load notification log in the correct container
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
        ]
    },

    'unified-logs-demo.html': {
        name: 'Unified Logs Demo',
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async (pageConfig) => {
                console.log('📊 Initializing Unified Logs Demo...');
                
                // Initialize Unified Log System
                if (window.UnifiedLogAPI) {
                    try {
                        await window.UnifiedLogAPI.initialize();
                        console.log('✅ Unified Log System initialized for demo');
                    } catch (error) {
                        console.warn('⚠️ Failed to initialize Unified Log System for demo:', error);
                    }
                }
            }
        ]
    },
    
    'db_display': {
        name: 'Database Display',
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                console.log('🗄️ Initializing Database Display...');
                
                if (typeof window.loadDatabaseInfo === 'function') {
                    await window.loadDatabaseInfo();
                }
            }
        ]
    },
    
    'db_extradata': {
        name: 'Database Extra Data',
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                console.log('🗄️ Initializing Database Extra Data...');
                
                if (typeof window.loadExtraDataInfo === 'function') {
                    await window.loadExtraDataInfo();
                }
            }
        ]
    },
    
    'research': {
        name: 'Research',
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async (pageConfig) => {
                console.log('🔬 Initializing Research...');
                
                // Initialize research page (loads data and creates charts)
                if (typeof window.initializeResearchPage === 'function') {
                    await window.initializeResearchPage();
                }
            }
        ]
    },
    
    'cache-test': {
        name: 'Cache Test',
        requiresFilters: true,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async (pageConfig) => {
                console.log('🧪 Initializing Cache Test Page via UnifiedAppInitializer...');
                
                // Initialize Cache Test Page if not already initialized
                if (!window.cacheTestPage) {
                    console.log('🚀 Creating Cache Test Page instance...');
                    
                    // Wait for DOM to be ready
                    if (document.readyState === 'loading') {
                        await new Promise(resolve => {
                            document.addEventListener('DOMContentLoaded', resolve, { once: true });
                        });
                    }
                    
                    // Create and initialize Cache Test Page
                    if (typeof CacheTestPage !== 'undefined') {
                        window.cacheTestPage = new CacheTestPage();
                        window.cacheTestPage.init();
                        console.log('✅ Cache Test Page initialized via UnifiedAppInitializer');
                    } else {
                        console.error('❌ CacheTestPage class not available');
                    }
                } else {
                    console.log('✅ Cache Test Page already initialized');
                }
                
                // Ensure cache systems are ready
                if (typeof window.initializeAllCacheSystems === 'function') {
                    try {
                        await window.initializeAllCacheSystems(true); // isInitialLoad = true
                        console.log('✅ Cache systems initialized for Cache Test Page');
                    } catch (error) {
                        console.error('❌ Failed to initialize cache systems:', error);
                    }
                }
            }
        ]
    }
};

// ===== CONFIGURATION HELPER FUNCTIONS =====

/**
 * Get page configuration by page name
 * @param {string} pageName - Page name
 * @returns {Object} Page configuration
 */
window.getPageConfig = function(pageName) {
    return PAGE_CONFIGS[pageName] || {
        name: pageName,
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: []
    };
};

/**
 * Get all available page configurations
 * @returns {Object} All page configurations
 */
window.getAllPageConfigs = function() {
    return PAGE_CONFIGS;
};

/**
 * Check if page requires specific system
 * @param {string} pageName - Page name
 * @param {string} system - System name (filters, validation, tables)
 * @returns {boolean} Whether page requires the system
 */
window.pageRequiresSystem = function(pageName, system) {
    const config = window.getPageConfig(pageName);
    
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
 * Get page initialization summary
 * @param {string} pageName - Page name
 * @returns {Object} Initialization summary
 */
window.getPageInitSummary = function(pageName) {
    const config = window.getPageConfig(pageName);
    
    return {
        name: config.name,
        systems: {
            filters: config.requiresFilters,
            validation: config.requiresValidation,
            tables: config.requiresTables
        },
        customInitializers: config.customInitializers.length,
        totalSystems: (config.requiresFilters ? 1 : 0) + 
                     (config.requiresValidation ? 1 : 0) + 
                     (config.requiresTables ? 1 : 0) + 
                     config.customInitializers.length
    };
};

// ===== GLOBAL EXPORT =====

window.PAGE_CONFIGS = PAGE_CONFIGS;
window.pageInitializationConfigs = PAGE_CONFIGS;

