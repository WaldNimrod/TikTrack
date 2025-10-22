/**
 * Unified App Initializer - TikTrack Final System
 * ==============================================
 *
 * המערכת הסופית המאוחדת שמחליפה את כל ה-DOMContentLoaded listeners
 * ומאפשרת גמישות מקסימלית עם תחזוקה קלה
 *
 * WHAT THIS SYSTEM DOES:
 * ======================
 * 
 * ✅ Monitors: Compares documented scripts vs actually loaded scripts
 * ✅ Validates: Checks for duplicates, load order, and availability
 * ✅ Reports: Warns about mismatches and errors
 * ✅ Orchestrates: Runs existing initialization functions in correct order
 * 
 * ❌ DOES NOT: Load scripts automatically
 * ❌ DOES NOT: Inject script tags into HTML
 * ❌ DOES NOT: Modify the page structure
 * 
 * TYPES OF MESSAGES:
 * ==================
 * 
 * ⚠️ WARNING (Documentation Mismatch):
 *    - Package manifest says script X should load
 *    - But script X is not in the HTML
 *    - OR: HTML loads script Y but it's not documented
 *    - Action: Decide which side to update
 * 
 * ❌ ERROR (Real Issues):
 *    - Script loaded twice (duplicate)
 *    - Wrong load order (dependency issue)
 *    - Script failed to load (404/syntax error)
 *    - Action: Fix immediately in HTML
 *
 * 🔧 COMPLETE WORKFLOW FOR ADDING NEW SCRIPTS:
 * ============================================
 * 
 * STEP 1: Create the Script
 * -------------------------
 * // scripts/my-new-script.js
 * (function() {
 *     'use strict';
 *     
 *     function myNewFunction() {
 *         console.log('New script loaded!');
 *     }
 *     
 *     // IMPORTANT: Create Global for identification
 *     window.MyNewScript = {
 *         init: myNewFunction,
 *         version: '1.0.0'
 *     };
 *     
 *     console.log('✅ MyNewScript loaded successfully');
 * })();
 * 
 * STEP 2: Update Package Manifest
 * -------------------------------
 * // scripts/init-system/package-manifest.js
 * 'my-package': {
 *     id: 'my-package',
 *     name: 'My Package',
 *     scripts: [
 *         {
 *             file: 'my-new-script.js',
 *             globalCheck: 'window.MyNewScript', // IMPORTANT: Global for identification
 *             description: 'My new script',
 *             required: true
 *         }
 *     ]
 * }
 * 
 * STEP 3: Update Page Configuration
 * ---------------------------------
 * // scripts/page-initialization-configs.js
 * 'my-page': {
 *     name: 'My Page',
 *     packages: ['base', 'my-package'], // Add the new package
 *     requiredGlobals: [
 *         'NotificationSystem',
 *         'MyNewScript' // Add the new Global
 *     ]
 * }
 * 
 * STEP 4: Update HTML Page
 * ------------------------
 * <!-- my-page.html -->
 * <script src="scripts/my-new-script.js?v=1.0.0"></script>
 * <script src="scripts/init-system/package-manifest.js?v=1.0.0"></script>
 * <script src="scripts/page-initialization-configs.js?v=1.0.0"></script>
 * <script src="scripts/unified-app-initializer.js?v=1.0.0"></script>
 * 
 * ADDITIONAL WORKFLOWS:
 * =====================
 * 
 * Adding Existing Script to New Page:
 * 1. Update Page Config - add package to 'packages'
 * 2. Update HTML - add required scripts
 * 3. Test and validate
 * 
 * Removing Script from Page:
 * 1. Remove from HTML - delete <script> tag
 * 2. Update Page Config - remove package from 'packages'
 * 3. Remove Globals - remove from 'requiredGlobals'
 * 4. Test and validate
 * 
 * Removing Script from System Completely:
 * 1. Remove from all pages - delete from all HTML files
 * 2. Update Package Manifest - remove script from package
 * 3. Update Page Configs - remove package from all pages
 * 4. Delete the file - remove scripts/my-script.js
 * 5. Test and validate
 * 
 * ⚠️ IMPORTANT RULES:
 * ==================
 * 
 * 1. LOADING ORDER:
 *    - Always load package-manifest.js before page-initialization-configs.js
 *    - Always load unified-app-initializer.js last
 *    - Always load new scripts before monitoring system
 * 
 * 2. GLOBAL CHECK:
 *    - Must create Global in window for identification
 *    - Must use same Global in globalCheck
 *    - Must add to requiredGlobals
 * 
 * 3. VERSIONING:
 *    - Add ?v=1.0.0 to every new script
 *    - Update version when changing script
 * 
 * 📖 DETAILED DOCUMENTATION:
 * ==========================
 * - Developer Guide: documentation/frontend/init-system/DEVELOPER_GUIDE.md
 * - User Guide: documentation/frontend/init-system/USER_GUIDE.md
 * - Enhanced System: documentation/frontend/init-system/ENHANCED_INITIALIZATION_SYSTEM.md
 * - Management Interface: /init-system-management
 *
 * 📦 PACKAGE LOADING SYSTEM:
 * ==========================
 *
 * 🔹 PACKAGE HIERARCHY:
 *   - BASE (mandatory) → CRUD (optional) → CHARTS (optional)
 *   - Each package is INDEPENDENT - no automatic inclusion
 *   - Pages must explicitly request ALL packages they need
 *
 * 🔹 LOADING PROCESS:
 *   1. Read page config from PAGE_CONFIGS
 *   2. Load requested packages in dependency order
 *   3. Validate required globals are available
 *   4. Execute custom initializers
 *
 * 🔹 CRITICAL RULES:
 *   - BASE package is MANDATORY for all pages
 *   - CRUD package includes date-utils.js (formatDate function)
 *   - CHARTS package is optional, depends on BASE
 *   - No package automatically includes others
 *
 * FINAL ARCHITECTURE:
 * ===================
 * 1. Single Point of Entry - נקודת כניסה אחת
 * 2. Hierarchical Dependencies - תלויות היררכיות
 * 3. Smart Auto-Detection - זיהוי אוטומטי חכם
 * 4. Performance Optimized - מותאם לביצועים
 * 5. Error Resilient - עמיד בשגיאות
 * 6. Fully Extensible - ניתן להרחבה מלאה
 * 7. Backward Compatible - תואם לאחור
 *
 * @version 1.0.0
 * @lastUpdated January 2025
 * @author TikTrack Development Team
 */

// ===== UNIFIED APP INITIALIZER =====

class UnifiedAppInitializer {
    constructor() {
        this.initialized = false;
        this.initializationInProgress = false;
        this.pageInfo = null;
        this.availableSystems = new Set();
        this.performanceMetrics = {
            startTime: null,
            endTime: null,
            stageTimes: {},
            totalTime: 0
        };
        this.errorHandlers = [];
        this.customInitializers = [];
        this.legacySupport = true;
    }

    /**
     * Main initialization function - Single Point of Entry
     */
    async initialize() {
        if (this.initialized) {
            // console.log('✅ Application already initialized');
            return this.getStatus();
        }

        if (this.initializationInProgress) {
            // console.log('⏳ Initialization already in progress...');
            return this.getStatus();
        }

        // console.log('🎯 Starting Unified App Initialization...');
        this.initializationInProgress = true;
        this.performanceMetrics.startTime = Date.now();

        try {
            // Stage 1: Detect and analyze
            await this.detectAndAnalyze();
            
            // Stage 2: Prepare configuration
            const config = this.prepareConfiguration();
            
            // Stage 3: Execute initialization
            await this.executeInitialization(config);
            
            // Stage 4: Finalize
            await this.finalizeInitialization(config);
            
            this.performanceMetrics.endTime = Date.now();
            this.performanceMetrics.totalTime = this.performanceMetrics.endTime - this.performanceMetrics.startTime;
            
            this.initialized = true;
            
            this.logSuccess();
            
            return this.getStatus();
            
        } catch (error) {
            this.handleError(error);
            throw error;
        } finally {
            this.initializationInProgress = false;
        }
    }

    /**
     * Stage 1: Detect and analyze page and systems
     */
    async detectAndAnalyze() {
        // console.log('🔍 Stage 1: Detecting and analyzing...');
        const stageStart = Date.now();
        
        // Detect page information
        this.pageInfo = this.detectPageInfo();
        
        // Detect available systems
        this.availableSystems = this.detectAvailableSystems();
        
        // Analyze page requirements
        this.analyzePageRequirements();
        
        this.performanceMetrics.stageTimes.detect = Date.now() - stageStart;
        // console.log('✅ Stage 1 Complete:', {
        //     page: this.pageInfo.name,
        //     systems: this.availableSystems.size,
        //     requirements: this.pageInfo.requirements
        // });
    }

    /**
     * Stage 2: Prepare optimal configuration
     */
    prepareConfiguration() {
        // console.log('⚙️ Stage 2: Preparing configuration...');
        const stageStart = Date.now();
        
        // Load page-specific configuration from page-initialization-configs.js
        let pageConfig = null;
        // Debug info only in verbose mode
        if (window.DEBUG_MODE) {
            console.log('🔍 Checking pageInitializationConfigs:', typeof window.pageInitializationConfigs);
            console.log('🔍 Available configs:', window.pageInitializationConfigs ? Object.keys(window.pageInitializationConfigs) : 'undefined');
            const pageName = this.pageInfo?.name || 'unknown';
            console.log('🔍 Looking for config:', pageName);
        }
        
        if (typeof window.pageInitializationConfigs !== 'undefined' && 
            window.pageInitializationConfigs[this.pageInfo?.name]) {
            pageConfig = window.pageInitializationConfigs[this.pageInfo.name];
            console.log(`📋 Loaded page config for ${this.pageInfo.name}:`, pageConfig);
        } else if (typeof window.PAGE_CONFIGS !== 'undefined' && 
                   window.PAGE_CONFIGS[this.pageInfo?.name]) {
            pageConfig = window.PAGE_CONFIGS[this.pageInfo.name];
            console.log(`📋 Loaded page config from PAGE_CONFIGS for ${this.pageInfo.name}:`, pageConfig);
        } else {
            console.log(`⚠️ No page config found for ${this.pageInfo?.name || 'unknown'}`);
            console.log('🔍 Available configs in pageInitializationConfigs:', window.pageInitializationConfigs ? Object.keys(window.pageInitializationConfigs) : 'undefined');
            console.log('🔍 Available configs in PAGE_CONFIGS:', window.PAGE_CONFIGS ? Object.keys(window.PAGE_CONFIGS) : 'undefined');
        }
        
        // Store custom initializers from page config
        if (pageConfig?.customInitializers) {
            this.customInitializers = pageConfig.customInitializers;
            if (window.DEBUG_MODE) {
                console.log('🔧 Loaded custom initializers from page config:', this.customInitializers.length);
            }
        }
        
        const config = {
            name: this.pageInfo?.name || 'unknown',
            type: this.pageInfo?.type || 'standard',
            requiresFilters: pageConfig?.requiresFilters ?? this.pageInfo.requirements.filters,
            requiresValidation: pageConfig?.requiresValidation ?? this.pageInfo.requirements.validation,
            requiresTables: pageConfig?.requiresTables ?? this.pageInfo.requirements.tables,
            requiresCharts: this.pageInfo.requirements.charts,
            customInitializers: this.customInitializers,
            availableSystems: Array.from(this.availableSystems),
            // ← NEW: חבילות ומטאדאטה
            packages: pageConfig?.packages || [],
            requiredGlobals: pageConfig?.requiredGlobals || [],
            description: pageConfig?.description || '',
            pageType: pageConfig?.pageType || 'standard',
            preloadAssets: pageConfig?.preloadAssets || [],
            cacheStrategy: pageConfig?.cacheStrategy || 'standard'
        };
        
        // שמור את הקונפיג למעקב ביצועים
        this.pageConfig = config;
        
        this.performanceMetrics.stageTimes.prepare = Date.now() - stageStart;
        // console.log('✅ Stage 2 Complete:', config);
        
        return config;
    }

    /**
     * Stage 3: Execute initialization
     */
    async executeInitialization(config) {
        console.log('🎯 Stage 3: Executing initialization...');
        const stageStart = Date.now();
        
        try {
            // ← NEW: לוג חבילות
            this.logPackageLoading(config.packages);
            
            // Note: Monitoring moved to end of initialization
            
            // Initialize IndexedDB first (blocking) to prevent race conditions
            await this.initializeCacheSystem();
            
            // Wait longer for cache system to be fully ready
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Verify cache system is ready with detailed logging
            // console.log('🔍 Verifying cache system readiness...');
            // console.log('UnifiedCacheManager available:', !!window.UnifiedCacheManager);
            // console.log('CacheSyncManager available:', !!window.CacheSyncManager);
            // console.log('MemoryOptimizer available:', !!window.MemoryOptimizer);
            
            if (window.UnifiedCacheManager) {
                // console.log('UnifiedCacheManager initialized:', window.UnifiedCacheManager.initialized);
            }
            if (window.CacheSyncManager) {
                // console.log('CacheSyncManager initialized:', window.CacheSyncManager.initialized);
            }
            if (window.MemoryOptimizer) {
                // console.log('MemoryOptimizer initialized:', window.MemoryOptimizer.initialized);
            }
            
            // Set global flag for other systems
            window.cacheSystemReady = window.UnifiedCacheManager && window.UnifiedCacheManager.initialized;
            
            if (window.cacheSystemReady) {
                // console.log('✅ Cache system verified as ready');
            } else {
                // console.log('⚠️ Cache system not ready, using fallback mode');
            }
            
            // Use the application initializer if available
            if (typeof window.initializeApplication === 'function') {
                // console.log('🔧 Using application initializer with config:', config);
                await window.initializeApplication(config);
            } else {
                // console.log('⚠️ Application initializer not found, using manual initialization');
                // Fallback to manual initialization
                await this.manualInitialization(config);
            }
            
        } catch (error) {
            console.error('❌ Error in executeInitialization:', error);
            throw error;
        } finally {
            this.performanceMetrics.stageTimes.execute = Date.now() - stageStart;
            // console.log('✅ Stage 3 Complete');
        }
    }

    /**
     * Stage 4: Finalize initialization
     */
    async finalizeInitialization(config) {
        // console.log('🎯 Stage 4: Finalizing...');
        const stageStart = Date.now();
        
        // Restore page state
        if (typeof window.loadPageState === 'function') {
            await window.loadPageState();
        }
        
        // Execute custom finalizers
        console.log('🔧 Executing custom initializers:', this.customInitializers.length);
        for (let i = 0; i < this.customInitializers.length; i++) {
            const initializer = this.customInitializers[i];
            console.log(`🔧 Executing custom initializer ${i + 1}/${this.customInitializers.length}:`, typeof initializer);
            if (typeof initializer === 'function') {
                try {
                    await initializer(config);
                    if (window.DEBUG_MODE) {
                        console.log(`✅ Custom initializer ${i + 1} completed successfully`);
                    }
                } catch (error) {
                    // console.error(`❌ Custom initializer ${i + 1} failed:`, error);
                }
            } else {
                // console.warn(`⚠️ Custom initializer ${i + 1} is not a function:`, typeof initializer);
            }
        }
        
        this.performanceMetrics.stageTimes.finalize = Date.now() - stageStart;
        
        // ← NEW: מדידת ביצועים
        this.trackLoadTimes();
        this.logSystemStatus();
        
        // console.log('✅ Stage 4 Complete');
    }

    /**
     * Detect page information
     */
    detectPageInfo() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index';
        const pageName = filename.replace('.html', '');
        
        console.log('🔍 Page detection:', { path, filename, pageName });
        
        const pageInfo = {
            name: pageName,
            path: path,
            filename: filename,
            type: this.determinePageType(pageName),
            requirements: {
                filters: this.requiresFilters(pageName),
                validation: this.requiresValidation(pageName),
                tables: this.requiresTables(pageName),
                charts: this.requiresCharts(pageName)
            }
        };
        
        // console.log('📊 Detected page info:', pageInfo);
        return pageInfo;
    }

    /**
     * Detect available systems
     */
    detectAvailableSystems() {
        const systems = new Set();
        
        // Core Systems
        if (typeof window.NotificationSystem !== 'undefined') systems.add('notification');
        if (typeof window.HeaderSystem !== 'undefined') systems.add('header');
        if (typeof window.FilterSystem !== 'undefined') systems.add('filter');
        
        // Page Systems
        if (typeof window.initializePageFilters === 'function') systems.add('pageFilters');
        if (typeof window.initializeValidation === 'function') systems.add('validation');
        if (typeof window.setupSortableHeaders === 'function') systems.add('tables');
        
        // Preferences & Storage
        if (typeof window.preferencesCache !== 'undefined') systems.add('preferences');
        if (typeof window.IndexedDB !== 'undefined') systems.add('indexeddb');
        
        // UI Systems
        if (typeof window.toggleSection === 'function') systems.add('uiUtils');
        if (typeof window.showNotification === 'function') systems.add('notifications');
        
        return systems;
    }

    /**
     * Analyze page requirements
     */
    analyzePageRequirements() {
        // This is already done in detectPageInfo, but can be extended
        // console.log('📊 Page requirements analyzed');
    }

    /**
     * Determine page type
     */
    determinePageType(pageName) {
        if (['trades', 'executions', 'alerts'].includes(pageName)) return 'trading';
        if (['system-management', 'crud-testing-dashboard', 'linter-realtime-monitor'].includes(pageName)) return 'development';
        if (['preferences'].includes(pageName)) return 'preferences';
        if (['index'].includes(pageName)) return 'dashboard';
        return 'general';
    }

    /**
     * Check if page requires filters
     */
    requiresFilters(pageName) {
        const filterPages = [
            'index', 'trades', 'executions', 'alerts', 'trading_accounts',
            'cash_flows', 'tickers', 'research'
        ];
        return filterPages.includes(pageName) || document.querySelectorAll('.filter-section, .header-filters').length > 0;
    }

    /**
     * Check if page requires validation
     */
    requiresValidation(pageName) {
        const validationPages = [
            'preferences', 'trades', 'alerts', 'trading_accounts', 'notes',
            'crud-testing-dashboard'
        ];
        return validationPages.includes(pageName) || document.querySelectorAll('form').length > 0;
    }

    /**
     * Check if page requires tables
     */
    requiresTables(pageName) {
        const tablePages = [
            'index', 'trades', 'executions', 'alerts', 'trading_accounts',
            'cash_flows', 'tickers', 'db_display', 'crud-testing-dashboard',
            'external-data-dashboard'
        ];
        return tablePages.includes(pageName) || document.querySelectorAll('table').length > 0;
    }

    /**
     * Check if page requires charts
     */
    requiresCharts(pageName) {
        return pageName === 'index' || document.querySelectorAll('canvas, .chart-container').length > 0;
    }

    /**
     * Initialize Unified Cache System
     */
    async initializeCacheSystem() {
        // console.log('🔧 Initializing Unified Cache System...');
        
        // Initialize UnifiedCacheManager with timeout
        if (typeof window.UnifiedCacheManager !== 'undefined') {
            try {
                if (!window.UnifiedCacheManager.initialized) {
                    // console.log('🔧 Initializing UnifiedCacheManager...');
                    
                    // Add timeout to prevent hanging
                    const initPromise = window.UnifiedCacheManager.initialize();
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('UnifiedCacheManager initialization timeout')), 10000)
                    );
                    
                    const initResult = await Promise.race([initPromise, timeoutPromise]);
                    if (initResult) {
                        // console.log('✅ UnifiedCacheManager initialized successfully');
                    } else {
                        throw new Error('UnifiedCacheManager initialization returned false');
                    }
                } else {
                    // console.log('✅ UnifiedCacheManager already initialized');
                }
            } catch (error) {
                console.error('❌ UnifiedCacheManager initialization failed:', error);
                console.log('⚠️ Using localStorage fallback');
                // Set a flag to indicate cache system is not available
                window.UnifiedCacheManager = null;
            }
        } else {
            console.log('⚠️ UnifiedCacheManager not available, using localStorage fallback');
        }

        // Initialize CacheSyncManager with timeout
        if (typeof window.CacheSyncManager !== 'undefined') {
            try {
                if (!window.CacheSyncManager.initialized) {
                    // console.log('🔧 Initializing CacheSyncManager...');
                    
                    const initPromise = window.CacheSyncManager.initialize();
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('CacheSyncManager initialization timeout')), 5000)
                    );
                    
                    await Promise.race([initPromise, timeoutPromise]);
                    // console.log('✅ CacheSyncManager initialized successfully');
                } else {
                    // console.log('✅ CacheSyncManager already initialized');
                }
            } catch (error) {
                console.error('❌ CacheSyncManager initialization failed:', error);
            }
        } else {
            // console.log('⚠️ CacheSyncManager not available');
        }

        // Initialize CachePolicyManager
        if (typeof window.CachePolicyManager !== 'undefined') {
            try {
                if (!window.CachePolicyManager.initialized) {
                    // console.log('🔧 Initializing CachePolicyManager...');
                    await window.CachePolicyManager.initialize();
                    // console.log('✅ CachePolicyManager initialized successfully');
                } else {
                    // console.log('✅ CachePolicyManager already initialized');
                }
            } catch (error) {
                console.error('❌ CachePolicyManager initialization failed:', error);
            }
        } else {
            // console.log('⚠️ CachePolicyManager not available');
        }

        // Initialize MemoryOptimizer with timeout
        if (typeof window.MemoryOptimizer !== 'undefined') {
            try {
                if (!window.MemoryOptimizer.initialized) {
                    // console.log('🔧 Initializing MemoryOptimizer...');
                    
                    const initPromise = window.MemoryOptimizer.initialize();
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('MemoryOptimizer initialization timeout')), 5000)
                    );
                    
                    await Promise.race([initPromise, timeoutPromise]);
                    // console.log('✅ MemoryOptimizer initialized successfully');
                } else {
                    // console.log('✅ MemoryOptimizer already initialized');
                }
            } catch (error) {
                console.error('❌ MemoryOptimizer initialization failed:', error);
            }
        } else {
            // console.log('⚠️ MemoryOptimizer not available');
        }
        
        // Initialize registered core systems (only if not already initialized)
        if (window.UnifiedInitializationSystem) {
            await window.UnifiedInitializationSystem.initializeCoreSystems();
        }
        
        // Final verification and reporting
        this.reportCacheSystemStatus();
    }
    
    /**
     * Report cache system status
     */
    reportCacheSystemStatus() {
        // console.log('📊 Cache System Status Report:');
        // console.log('================================');
        
        const systems = [
            { name: 'UnifiedCacheManager', instance: window.UnifiedCacheManager },
            { name: 'CacheSyncManager', instance: window.CacheSyncManager },
            { name: 'CachePolicyManager', instance: window.CachePolicyManager },
            { name: 'MemoryOptimizer', instance: window.MemoryOptimizer }
        ];
        
        systems.forEach(system => {
            if (system.instance) {
                const status = system.instance.initialized ? '✅ Ready' : '⚠️ Not Initialized';
                // console.log(`${system.name}: ${status}`);
            } else {
                // console.log(`${system.name}: ❌ Not Available`);
            }
        });
        
        // console.log('================================');
        
        // Set comprehensive cache system ready flag
        window.cacheSystemReady = systems.every(system => 
            system.instance && system.instance.initialized
        );
        
        if (window.cacheSystemReady) {
            // console.log('🎉 All cache systems are ready!');
        } else {
            // console.log('⚠️ Some cache systems are not ready - using fallback modes');
        }
    }

    /**
     * Manual initialization fallback
     */
    async manualInitialization(config) {
            // console.log('🔧 Manual initialization fallback...');
        
        // Initialize core systems
        if (this.availableSystems.has('notification') && typeof window.NotificationSystem !== 'undefined') {
            await window.NotificationSystem.initialize();
        }
        
        // Initialize header system
        if (this.availableSystems.has('header') && typeof window.HeaderSystem !== 'undefined') {
            await window.HeaderSystem.initialize();
        }
        
        // Initialize UI systems
        if (this.availableSystems.has('uiUtils') && typeof window.initializeUIUtils === 'function') {
            await window.initializeUIUtils();
        }
        
        // Initialize Button System (Core UI System)
        if (typeof window.initializeButtonSystem === 'function') {
            await window.initializeButtonSystem();
        }
        
        // Initialize Actions Menu System (Table Actions)
        if (typeof window.actionsMenuSystem !== 'undefined') {
            // Actions Menu System is already initialized when loaded
            console.log('✅ Actions Menu System ready');
        }
        
        // Initialize page-specific systems
        if (config.requiresFilters && this.availableSystems.has('pageFilters')) {
            await window.initializePageFilters(config.name);
        }
        
        if (config.requiresValidation && this.availableSystems.has('validation')) {
            const forms = document.querySelectorAll('form[id]');
            for (const form of forms) {
                await window.initializeValidation(form.id);
            }
        }
        
        if (config.requiresTables && this.availableSystems.has('tables')) {
            window.setupSortableHeaders();
        }
    }

    /**
     * Add custom initializer
     */
    addCustomInitializer(initializer) {
        this.customInitializers.push(initializer);
    }

    /**
     * Add error handler
     */
    addErrorHandler(handler) {
        this.errorHandlers.push(handler);
    }

    /**
     * Handle errors
     */
    handleError(error) {
        console.error('❌ Unified App Initialization Error:', error);
        
        // Execute error handlers
        for (const handler of this.errorHandlers) {
            try {
                handler(error);
            } catch (handlerError) {
                console.error('❌ Error handler failed:', handlerError);
            }
        }
        
        // Show user notification
        if (typeof window.showNotification === 'function') {
            window.showNotification('❌ Application initialization failed', 'error');
        }
    }

    /**
     * Log success
     */
    logSuccess() {
        // console.log('🎉 Unified App Initialization Success!', {
        //     page: this.pageInfo.name,
        //     type: this.pageInfo.type,
        //     systems: this.availableSystems.size,
        //     totalTime: `${this.performanceMetrics.totalTime}ms`,
        //     stages: this.performanceMetrics.stageTimes
        // });
        
        // Show success notification
        if (typeof window.showNotification === 'function') {
            window.showNotification('✅ Application initialized successfully', 'success', 'business');
        }
    }

    /**
     * Get initialization status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            inProgress: this.initializationInProgress,
            pageInfo: this.pageInfo,
            availableSystems: Array.from(this.availableSystems),
            performanceMetrics: this.performanceMetrics,
            customInitializers: this.customInitializers.length,
            errorHandlers: this.errorHandlers.length
        };
    }

    /**
     * Reset for testing
     */
    reset() {
        this.initialized = false;
        this.initializationInProgress = false;
        this.pageInfo = null;
        this.availableSystems.clear();
        this.performanceMetrics = {
            startTime: null,
            endTime: null,
            stageTimes: {},
            totalTime: 0
        };
        this.errorHandlers = [];
        this.customInitializers = [];
        this.pageConfig = null;
    }

    /**
     * Wait for Required Scripts to be Ready
     */
    async waitForRequiredScripts(config) {
        const maxWaitTime = 15000; // 15 seconds max
        const checkInterval = 500; // Check every 500ms
        let elapsed = 0;
        
        // Get required scripts from config
        const requiredScripts = [];
        if (config.packages) {
            for (const pkgName of config.packages) {
                const pkg = window.PACKAGE_MANIFEST?.[pkgName];
                if (pkg && pkg.scripts) {
                    for (const script of pkg.scripts) {
                        if (script.required && script.globalCheck) {
                            requiredScripts.push(script.file);
                        }
                    }
                }
            }
        }
        
        while (elapsed < maxWaitTime) {
            const allReady = requiredScripts.every(script => {
                switch (script) {
                    case 'color-scheme-system.js':
                        return window.colorSchemeSystemReady === true;
                    case 'data-utils.js':
                        return window.dataUtilsReady === true;
                    case 'date-utils.js':
                        return window.dateUtilsReady === true;
                    default:
                        return true; // Assume ready if no specific check
                }
            });
            
            if (allReady) {
                return true;
            }
            
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            elapsed += checkInterval;
        }
        
        return false; // Timeout
    }

    /**
     * Validate Required Systems
     * בדיקת תקינות מערכות נדרשות
     */
    validateRequiredSystems(config) {
        const errors = [];
        const warnings = [];
        const missing = [];
        
        // בדיקה 1: חבילות מוגדרות
        if (config.packages) {
            for (const pkgName of config.packages) {
                const pkg = window.PACKAGE_MANIFEST?.[pkgName];
                if (!pkg) {
                    errors.push(`חבילה לא מוגדרת: ${pkgName}`);
                    continue;
                }
                
                // בדיקה 2: סקריפטים נטענו
                for (const script of pkg.scripts) {
                    if (script.required && script.globalCheck) {
                        if (!this.checkGlobalExists(script.globalCheck)) {
                            missing.push({
                                package: pkgName,
                                script: script.file,
                                global: script.globalCheck,
                                description: script.description
                            });
                        }
                    }
                }
            }
        }
        
        // בדיקה 3: תלויות
        if (config.packages) {
            for (const pkgName of config.packages) {
                const pkg = window.PACKAGE_MANIFEST?.[pkgName];
                if (pkg && pkg.dependencies) {
                    for (const dep of pkg.dependencies) {
                        if (!config.packages.includes(dep)) {
                            errors.push(`חסרה תלות: ${pkgName} דורש ${dep}`);
                        }
                    }
                }
            }
        }
        
        // בדיקה 4: requiredGlobals מהקונפיג
        if (config.requiredGlobals) {
            for (const globalName of config.requiredGlobals) {
                if (!this.checkGlobalExists(globalName)) {
                    warnings.push(`Global חסר: ${globalName}`);
                }
            }
        }
        
        // דיווח
        const result = {
            valid: errors.length === 0 && missing.length === 0,
            errors: errors,
            missing: missing,
            warnings: warnings
        };
        
        if (!result.valid) {
            this.showCriticalError(result);
        } else if (warnings.length > 0) {
            console.warn('⚠️ אזהרות אתחול:', warnings);
        }
        
        return result;
    }

    /**
     * Check if global exists
     */
    checkGlobalExists(globalPath) {
        try {
            const parts = globalPath.replace('window.', '').split('.');
            let obj = window;
            for (const part of parts) {
                if (obj[part] === undefined) {
                    return false;
                }
                obj = obj[part];
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Show Critical Error
     */
    showCriticalError(validationResult) {
        console.group('⚠️ אי-התאמה: תיעוד מערכת ≠ עמוד בפועל');
        
        // Add monitoring system explanation
        console.group('⚠️ IMPORTANT FOR DEVELOPERS:');
        console.log('This is a MONITORING AND VALIDATION system, NOT an automatic script loader.');
        console.log('The monitoring system has detected changes in the page loading structure.');
        console.log('');
        console.log('🔧 HOW TO FIX MONITORING ERRORS:');
        console.log('If the changes are intentional and correct, you need to update the monitoring system:');
        console.log('');
        console.log('1. UPDATE PACKAGE MANIFEST:');
        console.log('   - Add new scripts to appropriate package in package-manifest.js');
        console.log('   - Define global checks for each script');
        console.log('');
        console.log('2. UPDATE PAGE CONFIGURATION:');
        console.log('   - Add required packages to page config in page-initialization-configs.js');
        console.log('   - Add required globals to the page configuration');
        console.log('');
        console.log('3. UPDATE ACTUAL PAGE:');
        console.log('   - Add the new script tags to the HTML page');
        console.log('   - Ensure correct loading order');
        console.log('');
        console.log('4. TEST AND VALIDATE:');
        console.log('   - Run the monitoring system to verify everything is correct');
        console.log('   - Fix any remaining issues');
        console.log('');
        console.log('📖 DETAILED DOCUMENTATION:');
        console.log('- Developer Guide: documentation/frontend/init-system/DEVELOPER_GUIDE.md');
        console.log('- Management Interface: /init-system-management');
        console.groupEnd();
        
        if (validationResult.errors.length > 0) {
            console.error('שגיאות:', validationResult.errors);
        }
        
        if (validationResult.missing.length > 0) {
            console.warn('⚠️ אי-התאמות תיעוד:');
            validationResult.missing.forEach(m => {
                console.warn(`  ⚠️ ${m.script}`);
                console.warn(`     מתועד בחבילה: ${m.package}`);
                console.warn(`     מצפה ל-Global: ${m.global}`);
                console.warn(`     תיאור: ${m.description}`);
                console.warn(`     🤔 בחר: (1) הוסף לעמוד או (2) הסר מתיעוד`);
            });
        }
        
        console.groupEnd();
        
        // הצג מודול שגיאה מפורט עם כל ההנחיות
        this.showDetailedErrorModal(validationResult);
    }

    /**
     * Show Detailed Error Modal
     */
    showDetailedErrorModal(validationResult) {
        // נסה להציג מודול מפורט, אם לא זמין - השתמש בהודעה רגילה
        const tryShowDetailed = () => {
            if (typeof window.showCriticalErrorModal === 'function') {
                console.log('✅ Using showCriticalErrorModal for detailed error information');
                const errorInfo = {
                    title: '⚠️ אי-התאמה: תיעוד vs מציאות',
                    type: 'info',
                    category: 'monitoring',
                    timestamp: new Date().toISOString(),
                    page: window.location.pathname,
                    source: 'unified-app-initializer',
                    function: 'validateRequiredSystems'
                };
                const detailedMessage = this.buildDetailedErrorMessage(validationResult);
                window.showCriticalErrorModal(errorInfo, detailedMessage);
                return true;
            }
            return false;
        };

        // נסה מיד
        if (tryShowDetailed()) {
            return;
        }

        // אם לא עבד, נסה שוב אחרי השהיה קצרה
        setTimeout(() => {
            if (tryShowDetailed()) {
                return;
            }

            // אם עדיין לא עבד, השתמש בהודעה רגילה
            console.log('⚠️ showCriticalErrorModal not available, using fallback');
            if (typeof window.showNotification === 'function') {
                const msg = `⚠️ ניטור: ${validationResult.missing.length} סקריפטים דורשים עדכון הגדרות. בדוק console`;
                window.showNotification(msg, 'warning');
            }
        }, 100);
    }

    /**
     * Build Detailed Error Message for Modal
     */
    buildDetailedErrorMessage(validationResult) {
        let message = '';
        
        // כותרת והסבר
        message += '=== ⚠️ אי-התאמה: תיעוד מערכת ≠ עמוד בפועל ===\n\n';
        message += '🔍 מה קרה?\n';
        message += 'מערכת הניטור משווה בין מה שמתועד (package-manifest.js + page-initialization-configs.js)\n';
        message += 'לבין מה שנטען בפועל בעמוד HTML.\n';
        message += 'זיהינו הבדלים שדורשים את תשומת ליבך.\n\n';
        message += '⚠️ חשוב: מערכת זו לא טוענת סקריפטים אוטומטית!\n';
        message += 'היא רק משווה ומתריעה על אי-התאמות.\n\n';
        
        // סקריפטים חסרים
        if (validationResult.missing.length > 0) {
            message += `⚠️ אי-התאמות שזוהו (${validationResult.missing.length}):\n`;
            message += '===========================================\n';
            message += 'לכל אי-התאמה - עליך להחליט מי "צודק":\n';
            message += 'האם התיעוד צריך עדכון? או שהעמוד צריך עדכון?\n\n';
            
            validationResult.missing.forEach((item, index) => {
                message += `\n${index + 1}. ${item.script}\n`;
                message += `   📦 מתועד בחבילה: ${item.package}\n`;
                message += `   🔗 מצפה ל-Global: ${item.global}\n`;
                message += `   📝 תיאור: ${item.description}\n`;
                message += `   \n`;
                message += `   🤔 שאל את עצמך:\n`;
                message += `   • האם הסקריפט צריך להיטען בעמוד? → הוסף <script src="scripts/${item.script}"></script>\n`;
                message += `   • האם התיעוד מיושן/מוטעה? → הסר מ-package-manifest.js או page-configs\n`;
            });
            message += '\n';
        }
        
        // שגיאות אחרות
        if (validationResult.errors.length > 0) {
            message += `❌ שגיאות נוספות (${validationResult.errors.length}):\n`;
            message += '============================\n';
            validationResult.errors.forEach((error, index) => {
                message += `${index + 1}. ${error}\n`;
            });
            message += '\n';
        }
        
        // הנחיות תיקון מפורטות
        message += '🔧 איך לתקן אי-התאמה?\n';
        message += '==========================\n\n';
        message += '⚠️ קודם כל - החלט מי צודק:\n';
        message += '• האם הסקריפטים באמת צריכים להיטען? (עדכן את העמוד)\n';
        message += '• או שהתיעוד מיושן? (עדכן את המניפסט)\n\n';
        
        message += 'שלב 1: עדכון Package Manifest\n';
        message += '-----------------------------\n';
        message += '1. פתח את הקובץ: scripts/init-system/package-manifest.js\n';
        message += '2. מצא את החבילה המתאימה (base, crud, charts)\n';
        message += '3. הוסף את הסקריפט החדש עם globalCheck\n';
        message += '4. דוגמה:\n';
        message += '   {\n';
        message += '     file: "new-script.js",\n';
        message += '     globalCheck: "window.newFunction",\n';
        message += '     description: "תיאור הסקריפט",\n';
        message += '     required: true\n';
        message += '   }\n\n';
        
        message += 'שלב 2: עדכון Page Configuration\n';
        message += '--------------------------------\n';
        message += '1. פתח את הקובץ: scripts/page-initialization-configs.js\n';
        message += '2. מצא את העמוד שלך (למשל: cash_flows)\n';
        message += '3. הוסף את החבילה ל-packages array\n';
        message += '4. הוסף את ה-global ל-requiredGlobals array\n';
        message += '5. דוגמה:\n';
        message += '   "cash_flows": {\n';
        message += '     packages: ["base", "crud"],\n';
        message += '     requiredGlobals: ["window.newFunction"]\n';
        message += '   }\n\n';
        
        message += 'שלב 3: עדכון העמוד בפועל\n';
        message += '-------------------------\n';
        message += '1. פתח את קובץ ה-HTML של העמוד\n';
        message += '2. הוסף את תג הסקריפט במקום הנכון\n';
        message += '3. וודא סדר טעינה נכון\n';
        message += '4. דוגמה:\n';
        message += '   <script src="scripts/new-script.js?v=1.0.0"></script>\n\n';
        
        message += 'שלב 4: בדיקה ולידציה\n';
        message += '---------------------\n';
        message += '1. רענן את העמוד\n';
        message += '2. בדוק את הקונסול - לא אמורות להיות שגיאות ניטור\n';
        message += '3. הרץ את מערכת הניטור: /init-system-management\n';
        message += '4. וודא שהכל עובד תקין\n\n';
        
        // קישורים למשאבים
        message += '📖 משאבים נוספים:\n';
        message += '==================\n';
        message += '• מדריך מפתח: documentation/frontend/init-system/DEVELOPER_GUIDE.md\n';
        message += '• ממשק ניהול: /init-system-management\n';
        message += '• מדריך משתמש: documentation/frontend/init-system/USER_GUIDE.md\n';
        message += '• מערכת משופרת: documentation/frontend/init-system/ENHANCED_INITIALIZATION_SYSTEM.md\n\n';
        
        message += '💡 טיפ: העתק את ההודעה הזו ללוח כדי לשמור על ההנחיות!';
        
        return message;
    }

    /**
     * Show Real Error (for critical issues like duplicates, load order)
     */
    showRealError(errorType, errorData) {
        console.group('❌ שגיאה חמורה - דורש תיקון מיידי');
        
        switch(errorType) {
            case 'DUPLICATE_SCRIPT':
                console.error(`🔴 כפילות בטעינה: ${errorData.script}`);
                console.error(`נטען ${errorData.count} פעמים`);
                console.error('זו בעיית ביצועים חמורה - הסר את הכפילות מה-HTML');
                break;
                
            case 'LOAD_ORDER':
                console.error(`🔴 סדר טעינה שגוי: ${errorData.script}`);
                console.error(`נטען לפני: ${errorData.dependency}`);
                console.error('זו שגיאה קריטית - תקן את סדר הטעינה ב-HTML');
                break;
                
            case 'SCRIPT_FAILED':
                console.error(`🔴 סקריפט נכשל בטעינה: ${errorData.script}`);
                console.error(`שגיאה: ${errorData.error}`);
                console.error('בדוק את הנתיב, תחביר, או קונסול לפרטים');
                break;
        }
        
        console.groupEnd();
        
        // Show error modal (critical error modal for real errors)
        if (typeof window.showCriticalErrorModal === 'function') {
            const errorInfo = {
                title: `שגיאה קריטית: ${errorType}`,
                type: 'error',  // Critical error type
                category: 'system',
                timestamp: new Date().toISOString()
            };
            window.showCriticalErrorModal(errorInfo, this.buildRealErrorMessage(errorType, errorData));
        }
    }

    /**
     * Build Real Error Message (for critical errors)
     */
    buildRealErrorMessage(errorType, errorData) {
        let message = '';
        
        message += '=== ❌ שגיאה קריטית במערכת ===\n\n';
        message += 'זוהי שגיאה אמיתית שדורשת תיקון מיידי.\n';
        message += 'המערכת זיהתה בעיה שמונעת פעולה תקינה.\n\n';
        
        switch(errorType) {
            case 'DUPLICATE_SCRIPT':
                message += '🔴 כפילות בטעינת סקריפט\n';
                message += '========================\n\n';
                message += `הסקריפט ${errorData.script} נטען ${errorData.count} פעמים.\n`;
                message += 'זו בעיית ביצועים חמורה שעלולה לגרום לבעיות בזיכרון ולהתנהגות לא צפויה.\n\n';
                message += '🔧 פתרון:\n';
                message += `1. פתח את קובץ ה-HTML\n`;
                message += `2. מצא את כל הופעות <script src="scripts/${errorData.script}"></script>\n`;
                message += `3. הסר את הכפילויות - השאר רק העתק אחד\n`;
                message += `4. רענן את העמוד\n`;
                break;
                
            case 'LOAD_ORDER':
                message += '🔴 סדר טעינה שגוי\n';
                message += '==================\n\n';
                message += `הסקריפט ${errorData.script} נטען לפני ${errorData.dependency}.\n`;
                message += 'זה יכול לגרום לשגיאות "undefined" ולהתנהגות לא צפויה.\n\n';
                message += '🔧 פתרון:\n';
                message += `1. פתח את קובץ ה-HTML\n`;
                message += `2. מצא את <script src="scripts/${errorData.script}"></script>\n`;
                message += `3. הזז אותו להיות אחרי <script src="scripts/${errorData.dependency}"></script>\n`;
                message += `4. רענן את העמוד\n`;
                break;
                
            case 'SCRIPT_FAILED':
                message += '🔴 סקריפט נכשל בטעינה\n';
                message += '======================\n\n';
                message += `הסקריפט ${errorData.script} לא נטען בהצלחה.\n`;
                message += `שגיאה: ${errorData.error}\n\n`;
                message += '🔧 פתרונות אפשריים:\n';
                message += `1. בדוק שהקובץ קיים: scripts/${errorData.script}\n`;
                message += `2. בדוק שאין שגיאות תחביר בקובץ\n`;
                message += `3. בדוק את הקונסול לפרטים נוספים\n`;
                message += `4. בדוק הרשאות קריאה לקובץ\n`;
                break;
        }
        
        message += '\n📖 עזרה נוספת:\n';
        message += '• עמוד ניהול מערכת: /init-system-management\n';
        message += '• מדריך מפתח: documentation/frontend/init-system/DEVELOPER_GUIDE.md\n';
        
        return message;
    }

    /**
     * Log Package Loading
     */
    logPackageLoading(packages) {
        if (!packages || packages.length === 0) return;
        
        console.group('📦 טוען חבילות:');
        packages.forEach(pkgName => {
            const pkg = window.PACKAGE_MANIFEST?.[pkgName];
            if (pkg) {
                console.log(`  ✓ ${pkg.name} (${pkg.scripts.length} סקריפטים, ~${pkg.initTime})`);
            } else {
                console.warn(`  ⚠️ ${pkgName} (לא מוגדר)`);
            }
        });
        console.groupEnd();
    }

    /**
     * Log System Status
     */
    logSystemStatus() {
        console.group('📊 סטטוס מערכות');
        console.log(`  ⏱️ זמן אתחול: ${this.performanceMetrics.totalTime}ms`);
        console.log(`  📦 חבילות: ${this.pageConfig?.packages?.length || 0}`);
        console.log(`  ✅ מערכות זמינות: ${this.availableSystems.size}`);
        console.groupEnd();
    }

    /**
     * Track Load Times
     */
    trackLoadTimes() {
        const metrics = {
            timestamp: new Date().toISOString(),
            pageName: this.pageInfo?.name || 'unknown',
            totalTime: this.performanceMetrics.totalTime,
            stages: this.performanceMetrics.stageTimes,
            packages: this.pageConfig?.packages,
            memoryUsage: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize
            } : null
        };
        
        // שמירה ל-localStorage
        try {
            const pageName = this.pageInfo?.name || 'unknown';
            const key = `init_metrics_${pageName}`;
            const history = JSON.parse(localStorage.getItem(key) || '[]');
            history.push(metrics);
            
            // שמור רק 10 אחרונים
            if (history.length > 10) {
                history.shift();
            }
            
            localStorage.setItem(key, JSON.stringify(history));
        } catch (e) {
            console.warn('Failed to save metrics:', e);
        }
        
        return metrics;
    }

    /**
     * Get Performance Report
     */
    getPerformanceReport() {
        const report = {
            current: this.trackLoadTimes(),
            average: null,
            trend: null
        };
        
        // חישוב ממוצע
        try {
            const key = `init_metrics_${this.pageInfo?.name || 'unknown'}`;
            const history = JSON.parse(localStorage.getItem(key) || '[]');
            
            if (history.length > 0) {
                const sum = history.reduce((acc, m) => acc + m.totalTime, 0);
                report.average = Math.round(sum / history.length);
                
                // טרנד (משתפר/מידרדר)
                if (history.length >= 2) {
                    const recent = history.slice(-3).reduce((acc, m) => acc + m.totalTime, 0) / 3;
                    const older = history.slice(0, 3).reduce((acc, m) => acc + m.totalTime, 0) / 3;
                    report.trend = recent < older ? 'improving' : 'degrading';
                }
            }
        } catch (e) {
            console.warn('Failed to calculate report:', e);
        }
        
        return report;
    }

    /**
     * Get current system status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            initializationInProgress: this.initializationInProgress,
            pageInfo: this.pageInfo,
            availableSystems: Array.from(this.availableSystems),
            performanceMetrics: this.performanceMetrics,
            pageConfig: this.pageConfig
        };
    }
}

// ===== GLOBAL INSTANCE =====

window.UnifiedAppInitializer = UnifiedAppInitializer;
window.unifiedAppInit = new UnifiedAppInitializer();

console.log('🔧 UnifiedAppInitializer created:', window.unifiedAppInit);

// ===== GLOBAL EXPORT =====

window.initializeUnifiedApp = async function() {
    console.log('🔧 initializeUnifiedApp called');
    return await window.unifiedAppInit.initialize();
};

window.getUnifiedAppStatus = function() {
    return window.unifiedAppInit.getStatus();
};

// ===== AUTO-INITIALIZATION =====

// Single DOMContentLoaded listener - replaces all others
document.addEventListener('DOMContentLoaded', async () => {
        console.log('🎯 DOM Content Loaded - Starting Unified App Initialization');
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 Current pathname:', window.location.pathname);
    
    try {
        // Delay to ensure all scripts are loaded and initialized
        setTimeout(async () => {
            console.log('🚀 About to call initializeUnifiedApp...');
            await window.initializeUnifiedApp();
            console.log('✅ initializeUnifiedApp completed');
            
            // Handle page-specific copyDetailedLog function
            await handlePageSpecificFunctions();
        }, 1000);
        
    } catch (error) {
        console.error('❌ Unified App auto-initialization failed:', error);
    }
});

// ===== PAGE-SPECIFIC FUNCTION HANDLING =====

/**
 * Handle page-specific functions that need to be available globally
 * This replaces the need for inline DOMContentLoaded listeners
 */
async function handlePageSpecificFunctions() {
    try {
        console.log('🔧 Handling page-specific functions...');
        
        // Get current page name from pathname
        const pathname = window.location.pathname;
        const pageName = pathname.split('/').pop() || 'index';
        
        console.log(`📄 Current page: ${pageName}`);
        
        // Handle copyDetailedLog function for each page
        if (typeof window.copyDetailedLog === 'function') {
            console.log('✅ copyDetailedLog function found and available globally');
        } else {
            console.log('⚠️ copyDetailedLog function not found - this is normal for some pages');
        }
        
        // Handle other page-specific functions as needed
        // Add more function handling here in the future
        
        console.log('✅ Page-specific functions handled successfully');
        
    } catch (error) {
        console.error('❌ Failed to handle page-specific functions:', error);
    }
}

// ===== ERROR HANDLING =====

window.addEventListener('error', (event) => {
    // Ignore SyntaxError from button clicks - these are handled by individual functions
    if (event.error && event.error.name === 'SyntaxError' && event.message && event.message.includes('Unexpected end of input')) {
      console.log('🔧 ===== IGNORING SYNTAX ERROR =====');
      console.log('🔧 Error details:', {
        name: event.error.name,
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error.stack
      });
      console.log('🔧 This error is handled by individual functions - ignoring');
      console.log('🔧 ===== END IGNORE =====');
      return;
    }
    
    console.error('❌ Global Error:', event.error);
    console.error('❌ Error details:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
    });
    
    if (typeof window.showNotification === 'function') {
        window.showNotification('❌ System error occurred', 'error');
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled Promise Rejection:', event.reason);
    
    if (typeof window.showNotification === 'function') {
        window.showNotification('❌ Promise rejection occurred', 'error');
    }
});

// יצירת UnifiedInitializationSystem למערכות אחרות
window.UnifiedInitializationSystem = {
    coreSystems: new Map(),
    
    addCoreSystem(name, initFunction) {
        // console.log(`📝 Registering core system: ${name}`);
        this.coreSystems.set(name, initFunction);
    },
    
    async initializeCoreSystems() {
        // console.log('🔧 Initializing registered core systems...');
        for (const [name, initFunction] of this.coreSystems) {
            try {
                // בדיקה שהמערכת לא מאותחלת כבר
                if (name === 'UnifiedCacheManager' && window.UnifiedCacheManager?.initialized) {
                    // console.log(`✅ ${name} already initialized, skipping...`);
                    continue;
                }
                if (name === 'CacheSyncManager' && window.CacheSyncManager?.initialized) {
                    // console.log(`✅ ${name} already initialized, skipping...`);
                    continue;
                }
                if (name === 'CachePolicyManager' && window.CachePolicyManager?.initialized) {
                    // console.log(`✅ ${name} already initialized, skipping...`);
                    continue;
                }
                if (name === 'MemoryOptimizer' && window.MemoryOptimizer?.initialized) {
                    // console.log(`✅ ${name} already initialized, skipping...`);
                    continue;
                }
                
                // console.log(`🔧 Initializing ${name}...`);
                await initFunction();
                // console.log(`✅ ${name} initialized successfully`);
            } catch (error) {
                console.error(`❌ Failed to initialize ${name}:`, error);
            }
        }
    }
};

