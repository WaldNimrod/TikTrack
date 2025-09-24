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
        requiresFilters: true,
        requiresValidation: false,
        requiresTables: true,
        customInitializers: [
            // Dashboard-specific initialization
            async (pageConfig) => {
                console.log('📊 Initializing Dashboard...');
                
                // Initialize charts if available
                if (typeof window.initializeCharts === 'function') {
                    await window.initializeCharts();
                }
                
                // Load dashboard data
                if (typeof window.loadDashboardData === 'function') {
                    await window.loadDashboardData();
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
                
                // Load all preferences
                if (typeof window.loadAllPreferences === 'function') {
                    await window.loadAllPreferences();
                }
                
                // Setup preference change handlers
                if (typeof window.setupPreferenceHandlers === 'function') {
                    window.setupPreferenceHandlers();
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
    
    'executions': {
        name: 'Executions',
        requiresFilters: true,
        requiresValidation: false,
        requiresTables: true,
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
    'trading_accounts': {
        name: 'Trading Accounts',
        requiresFilters: true,
        requiresValidation: true,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                console.log('🏦 Initializing Trading Accounts...');
                
                if (typeof window.loadAccountsData === 'function') {
                    await window.loadAccountsData();
                }
            }
        ]
    },
    
    'cash_flows': {
        name: 'Cash Flows',
        requiresFilters: true,
        requiresValidation: false,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                console.log('💰 Initializing Cash Flows...');
                
                if (typeof window.loadCashFlowsData === 'function') {
                    await window.loadCashFlowsData();
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
    
    // Development Tools
    'system-management': {
        name: 'System Management',
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async (pageConfig) => {
                console.log('🔧 Initializing System Management...');
                
                if (typeof window.loadSystemInfo === 'function') {
                    await window.loadSystemInfo();
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
                
                if (typeof window.loadExternalData === 'function') {
                    await window.loadExternalData();
                }
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
                
                if (typeof window.loadNotifications === 'function') {
                    await window.loadNotifications();
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
    
    'research': {
        name: 'Research',
        requiresFilters: true,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async (pageConfig) => {
                console.log('🔬 Initializing Research...');
                
                if (typeof window.initializeResearchTools === 'function') {
                    await window.initializeResearchTools();
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
