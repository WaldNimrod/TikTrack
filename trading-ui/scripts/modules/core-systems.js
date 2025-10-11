/**
 * Core Systems Module - TikTrack
 * מערכות ליבה חיוניות
 * 
 * @fileoverview מודול מערכות ליבה הכולל את המערכות הבסיסיות ביותר
 * @version 1.0.0
 * @author TikTrack Development Team
 * @created 2025-01-06
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
        
        // Dynamic Loading Support
        this.dynamicLoadingEnabled = false; // Static loading only
        this.loadedModules = new Set();
        this.moduleDependencies = new Map();
        this.loadingPromises = new Map();
        this.moduleConfigs = new Map();
        
        // Initialize module configurations
        this.initializeModuleConfigs();
    }

    /**
     * Initialize module configurations for dynamic loading
     * אתחול תצורות מודולים לטעינה דינמית
     */
    initializeModuleConfigs() {
        this.moduleConfigs.set('core-systems', {
            name: 'Core Systems',
            path: 'modules/core-systems.js',
            priority: 1,
            dependencies: [],
            required: true,
            size: '92KB'
        });

        this.moduleConfigs.set('ui-basic', {
            name: 'UI Basic',
            path: 'modules/ui-basic.js',
            priority: 2,
            dependencies: ['core-systems'],
            required: false,
            size: '56KB'
        });

        this.moduleConfigs.set('data-basic', {
            name: 'Data Basic',
            path: 'modules/data-basic.js',
            priority: 2,
            dependencies: ['core-systems'],
            required: false,
            size: '81KB'
        });

        this.moduleConfigs.set('ui-advanced', {
            name: 'UI Advanced',
            path: 'modules/ui-advanced.js',
            priority: 3,
            dependencies: ['ui-basic'],
            required: false,
            size: '100KB'
        });

        this.moduleConfigs.set('data-advanced', {
            name: 'Data Advanced',
            path: 'modules/data-advanced.js',
            priority: 3,
            dependencies: ['data-basic'],
            required: false,
            size: '14KB'
        });

        this.moduleConfigs.set('business-module', {
            name: 'Business Module',
            path: 'modules/business-module.js',
            priority: 4,
            dependencies: ['data-basic', 'ui-basic'],
            required: false,
            size: '124KB'
        });

        this.moduleConfigs.set('communication-module', {
            name: 'Communication Module',
            path: 'modules/communication-module.js',
            priority: 4,
            dependencies: ['core-systems'],
            required: false,
            size: '6.1KB'
        });

        this.moduleConfigs.set('cache-module', {
            name: 'Cache Module',
            path: 'modules/cache-module.js',
            priority: 2,
            dependencies: ['core-systems'],
            required: false,
            size: '38KB'
        });

        console.log('🔧 Module configurations initialized:', this.moduleConfigs.size, 'modules');
    }

    /**
     * Load module dynamically
     * טעינת מודול דינמית
     * 
     * @param {string} moduleName - Name of module to load
     * @returns {Promise<boolean>} Success status
     */
    async loadModule(moduleName) {
        if (this.loadedModules.has(moduleName)) {
            // console.log(`✅ Module ${moduleName} already loaded`);
            return true;
        }

        // Special check for core-systems - if UnifiedAppInitializer exists, mark as loaded
        if (moduleName === 'core-systems' && window.UnifiedAppInitializer) {
            // console.log(`✅ Module ${moduleName} already loaded (UnifiedAppInitializer exists)`);
            this.loadedModules.add(moduleName);
            return true;
        }

        if (this.loadingPromises.has(moduleName)) {
            console.log(`⏳ Module ${moduleName} already loading...`);
            return await this.loadingPromises.get(moduleName);
        }

        const config = this.moduleConfigs.get(moduleName);
        if (!config) {
            console.error(`❌ Module ${moduleName} not found in configurations`);
            return false;
        }

        console.log(`🚀 Loading module: ${config.name} (${config.size})`);

        const loadingPromise = this._loadModuleScript(moduleName, config);
        this.loadingPromises.set(moduleName, loadingPromise);

        try {
            const success = await loadingPromise;
            if (success) {
                this.loadedModules.add(moduleName);
                console.log(`✅ Module ${moduleName} loaded successfully`);
            }
            return success;
        } finally {
            this.loadingPromises.delete(moduleName);
        }
    }

    /**
     * Load module script
     * טעינת סקריפט מודול
     * 
     * @param {string} moduleName - Module name
     * @param {Object} config - Module configuration
     * @returns {Promise<boolean>} Success status
     */
    async _loadModuleScript(moduleName, config) {
        return new Promise((resolve, reject) => {
            // Check if script already exists
            const existingScript = document.querySelector(`script[data-module="${moduleName}"]`);
            if (existingScript) {
                // console.log(`✅ Module ${moduleName} script already exists`);
                resolve(true);
                return;
            }

            // Special check for core-systems module - check if UnifiedAppInitializer already exists
            if (moduleName === 'core-systems' && window.UnifiedAppInitializer) {
                // console.log(`✅ Module ${moduleName} already loaded (UnifiedAppInitializer exists)`);
                resolve(true);
                return;
            }

            // Create script element
            const script = document.createElement('script');
            script.src = `scripts/${config.path}`;
            script.setAttribute('data-module', moduleName);
            script.setAttribute('data-priority', config.priority);
            script.setAttribute('data-size', config.size);

            // Handle load success
            script.onload = () => {
                // console.log(`✅ Module ${moduleName} script loaded successfully`);
                resolve(true);
            };

            // Handle load error
            script.onerror = (error) => {
                console.error(`❌ Failed to load module ${moduleName}:`, error);
                resolve(false);
            };

            // Add to document
            document.head.appendChild(script);
        });
    }

    /**
     * Load modules based on page requirements
     * טעינת מודולים לפי דרישות העמוד
     * 
     * @param {Object} pageConfig - Page configuration
     * @returns {Promise<boolean>} Success status
     */
    async loadRequiredModules(pageConfig) {
        console.log('🔧 Loading required modules for page:', pageConfig.name);

        const requiredModules = this.getRequiredModules(pageConfig);
        console.log('📋 Required modules:', requiredModules);

        // Special handling for core-systems - if already loaded, mark as loaded
        if (requiredModules.includes('core-systems') && window.UnifiedAppInitializer) {
            // console.log('✅ Core systems already loaded, marking as loaded');
            this.loadedModules.add('core-systems');
        }

        // Load modules in priority order
        const sortedModules = this.sortModulesByPriority(requiredModules);
        
        for (const moduleName of sortedModules) {
            const success = await this.loadModule(moduleName);
            if (!success && this.moduleConfigs.get(moduleName).required) {
                console.error(`❌ Failed to load required module: ${moduleName}`);
                return false;
            }
        }

        // console.log('✅ All required modules loaded successfully');
        return true;
    }

    /**
     * Get required modules for page
     * קבלת מודולים נדרשים לעמוד
     * 
     * @param {Object} pageConfig - Page configuration
     * @returns {Array<string>} Required module names
     */
    getRequiredModules(pageConfig) {
        const required = ['core-systems']; // Always required

        // Add modules based on page requirements
        if (pageConfig.requiresTables || pageConfig.requiresValidation) {
            required.push('data-basic');
        }

        if (pageConfig.requiresFilters || pageConfig.requiresCharts || pageConfig.requiresUI) {
            required.push('ui-basic');
        }

        if (pageConfig.requiresCharts) {
            required.push('ui-advanced');
        }

        if (pageConfig.requiresDataExport || pageConfig.requiresDataImport) {
            required.push('data-advanced');
        }

        if (pageConfig.requiresBusinessLogic) {
            required.push('business-module');
        }

        if (pageConfig.requiresCommunication) {
            required.push('communication-module');
        }

        if (pageConfig.requiresCache) {
            required.push('cache-module');
        }

        // TEMPORARY FIX: Always load ui-advanced and business-module for trading pages
        // This ensures getTableColors and handleFunctionNotFound are available
        if (pageConfig.name && ['Executions', 'Trades', 'Alerts'].includes(pageConfig.name)) {
            if (!required.includes('ui-advanced')) {
                required.push('ui-advanced');
            }
            if (!required.includes('business-module')) {
                required.push('business-module');
            }
        }

        return [...new Set(required)]; // Remove duplicates
    }

    /**
     * Sort modules by priority
     * מיון מודולים לפי עדיפות
     * 
     * @param {Array<string>} moduleNames - Module names
     * @returns {Array<string>} Sorted module names
     */
    sortModulesByPriority(moduleNames) {
        return moduleNames.sort((a, b) => {
            const configA = this.moduleConfigs.get(a);
            const configB = this.moduleConfigs.get(b);
            return (configA?.priority || 999) - (configB?.priority || 999);
        });
    }

    /**
     * Get loading statistics
     * קבלת סטטיסטיקות טעינה
     * 
     * @returns {Object} Loading statistics
     */
    getLoadingStats() {
        const totalModules = this.moduleConfigs.size;
        const loadedModules = this.loadedModules.size;
        const loadingModules = this.loadingPromises.size;

        let totalSize = 0;
        let loadedSize = 0;

        for (const [name, config] of this.moduleConfigs) {
            const size = parseInt(config.size.replace('KB', ''));
            totalSize += size;
            
            if (this.loadedModules.has(name)) {
                loadedSize += size;
            }
        }

        return {
            totalModules,
            loadedModules,
            loadingModules,
            totalSize: `${totalSize}KB`,
            loadedSize: `${loadedSize}KB`,
            loadingProgress: `${Math.round((loadedModules / totalModules) * 100)}%`
        };
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
            console.log('⏳ Initialization already in progress...');
            return this.getStatus();
        }

        console.log('🎯 Starting Unified App Initialization...');
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
            await this.finalizeInitialization();
            
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
        console.log('🔍 Stage 1: Detecting and analyzing...');
        const stageStart = Date.now();
        
        // Detect page information
        this.pageInfo = this.detectPageInfo();
        
        // Detect available systems
        this.availableSystems = this.detectAvailableSystems();
        
        // Analyze page requirements
        this.analyzePageRequirements();
        
        this.performanceMetrics.stageTimes.detect = Date.now() - stageStart;
        console.log('✅ Stage 1 Complete:', {
            page: this.pageInfo.name,
            systems: this.availableSystems.size,
            requirements: this.pageInfo.requirements
        });
    }

    /**
     * Stage 2: Prepare optimal configuration
     */
    prepareConfiguration() {
        console.log('⚙️ Stage 2: Preparing configuration...');
        const stageStart = Date.now();
        
        // Load page-specific configuration from page-initialization-configs.js
        let pageConfig = null;
        // Debug info only in verbose mode
        if (window.DEBUG_MODE) {
            console.log('🔍 Checking pageInitializationConfigs:', typeof window.pageInitializationConfigs);
            console.log('🔍 Available configs:', window.pageInitializationConfigs ? Object.keys(window.pageInitializationConfigs) : 'undefined');
            console.log('🔍 Looking for config:', this.pageInfo.name);
        }
        
        if (typeof window.pageInitializationConfigs !== 'undefined' && 
            window.pageInitializationConfigs[this.pageInfo.name]) {
            pageConfig = window.pageInitializationConfigs[this.pageInfo.name];
            console.log(`📋 Loaded page config for ${this.pageInfo.name}:`, pageConfig);
        } else {
            console.log(`⚠️ No page config found for ${this.pageInfo.name}`);
            console.log('🔍 Available configs:', window.pageInitializationConfigs ? Object.keys(window.pageInitializationConfigs) : 'undefined');
        }
        
        // Store custom initializers from page config
        if (pageConfig?.customInitializers) {
            this.customInitializers = pageConfig.customInitializers;
            if (window.DEBUG_MODE) {
                console.log('🔧 Loaded custom initializers from page config:', this.customInitializers.length);
            }
        }
        
        const config = {
            name: this.pageInfo.name,
            type: this.pageInfo.type,
            requiresFilters: pageConfig?.requiresFilters ?? this.pageInfo.requirements.filters,
            requiresValidation: pageConfig?.requiresValidation ?? this.pageInfo.requirements.validation,
            requiresTables: pageConfig?.requiresTables ?? this.pageInfo.requirements.tables,
            requiresCharts: this.pageInfo.requirements.charts,
            customInitializers: this.customInitializers,
            availableSystems: Array.from(this.availableSystems)
        };
        
        this.performanceMetrics.stageTimes.prepare = Date.now() - stageStart;
        console.log('✅ Stage 2 Complete:', config);
        
        return config;
    }

    /**
     * Stage 3: Execute initialization
     */
    async executeInitialization(config) {
        console.log('🚀 Stage 3: Executing initialization...');
        const stageStart = Date.now();
        
        // Static loading - all modules already loaded
        console.log('✅ Static loading - all modules already loaded');
        
        // Initialize IndexedDB first (blocking) to prevent race conditions
        await this.initializeCacheSystem();
        
        // Wait longer for cache system to be fully ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verify cache system is ready
        console.log('🔍 Verifying cache system readiness...');
        console.log('UnifiedCacheManager available:', !!window.UnifiedCacheManager);
        
        if (window.UnifiedCacheManager) {
            console.log('UnifiedCacheManager initialized:', window.UnifiedCacheManager.initialized);
        }
        
        // Set global flag for other systems
        window.cacheSystemReady = window.UnifiedCacheManager && window.UnifiedCacheManager.initialized;
        
        if (window.cacheSystemReady) {
            console.log('✅ Cache system ready (4-layer architecture)');
        } else {
            console.log('⚠️ Cache system not ready, using localStorage fallback');
        }
        
        // Use the application initializer if available
        if (typeof window.initializeApplication === 'function') {
            console.log('🔧 Using application initializer with config:', config);
            await window.initializeApplication(config);
        } else {
            console.log('⚠️ Application initializer not found, using manual initialization');
            // Fallback to manual initialization
            await this.manualInitialization(config);
        }
        
        this.performanceMetrics.stageTimes.execute = Date.now() - stageStart;
        console.log('✅ Stage 3 Complete');
    }

    /**
     * Manual initialization fallback
     * Called when window.initializeApplication is not available
     */
    async manualInitialization(config) {
        console.log('🔧 Manual initialization fallback...');
        
        // Initialize Header System (Stage 2: UI Systems) - CRITICAL!
        if (typeof window.initializeHeaderSystem === 'function') {
            console.log('🎯 Initializing Header System...');
            window.initializeHeaderSystem();
        } else {
            console.warn('⚠️ initializeHeaderSystem not available');
        }
        
        // Initialize Notification System
        if (this.availableSystems.has('notification') && typeof window.NotificationSystem !== 'undefined') {
            console.log('🔔 Initializing Notification System...');
            await window.NotificationSystem.initialize();
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
        
        console.log('✅ Manual initialization completed');
    }

    /**
     * Stage 4: Finalize initialization
     */
    async finalizeInitialization() {
        console.log('🎯 Stage 4: Finalizing...');
        const stageStart = Date.now();
        
        // Restore page state
        if (typeof window.loadPageState === 'function') {
            await window.loadPageState();
        }
        
        // Execute custom finalizers with double initialization prevention
        if (window.DEBUG_MODE) {
            console.log('🔧 Executing custom initializers:', this.customInitializers.length);
        }
        for (let i = 0; i < this.customInitializers.length; i++) {
            const initializer = this.customInitializers[i];
            const initializerKey = `${this.pageInfo.name}_${i}`;
            
            // Check if this initializer was already executed
            if (window.globalInitializationState.customInitializers.has(initializerKey)) {
                console.log(`⚠️ Custom initializer ${i + 1} already executed, skipping...`);
                continue;
            }
            
            if (window.DEBUG_MODE) {
                console.log(`🔧 Executing custom initializer ${i + 1}/${this.customInitializers.length}:`, typeof initializer);
            }
            if (typeof initializer === 'function') {
                try {
                    await initializer();
                    // Mark as executed to prevent double execution
                    window.globalInitializationState.customInitializers.set(initializerKey, {
                        executed: true,
                        timestamp: Date.now(),
                        page: this.pageInfo.name
                    });
                    // if (window.DEBUG_MODE) {
                    //     console.log(`✅ Custom initializer ${i + 1} completed successfully`);
                    // }
                } catch (error) {
                    console.error(`❌ Custom initializer ${i + 1} failed:`, error);
                }
            } else {
                console.warn(`⚠️ Custom initializer ${i + 1} is not a function:`, typeof initializer);
            }
        }
        
        this.performanceMetrics.stageTimes.finalize = Date.now() - stageStart;
        console.log('✅ Stage 4 Complete');
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
        
        console.log('📊 Detected page info:', pageInfo);
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
        console.log('📊 Page requirements analyzed');
    }

    /**
     * Determine page type
     */
    determinePageType(pageName) {
        if (['trades', 'executions', 'alerts'].includes(pageName)) return 'trading';
        if (['system-management', 'crud-testing-dashboard', 'linter-realtime-monitor', 'cache-test'].includes(pageName)) return 'development';
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
        console.log('🔧 Initializing Unified Cache System...');
        
        // Initialize UnifiedCacheManager with timeout - only if not already initialized
        if (typeof window.UnifiedCacheManager !== 'undefined' && !window.UnifiedCacheManager.initialized) {
            try {
                console.log('🔧 Initializing UnifiedCacheManager...');
                
                // Add timeout to prevent hanging
                const initPromise = window.UnifiedCacheManager.initialize();
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('UnifiedCacheManager initialization timeout')), 10000)
                );
                
                const initResult = await Promise.race([initPromise, timeoutPromise]);
                if (initResult) {
                    console.log('✅ UnifiedCacheManager initialized successfully');
                } else {
                    throw new Error('UnifiedCacheManager initialization returned false');
                }
            } catch (error) {
                console.error('❌ UnifiedCacheManager initialization failed:', error);
                console.log('⚠️ Using localStorage fallback');
                // Set a flag to indicate cache system is not available
                window.UnifiedCacheManager = null;
            }
        } else if (window.UnifiedCacheManager?.initialized) {
            console.log('✅ UnifiedCacheManager already initialized');
        } else {
            console.log('⚠️ UnifiedCacheManager not available, using localStorage fallback');
        }

        // Advanced cache systems (CacheSyncManager, CachePolicyManager, MemoryOptimizer)
        // are optional and not currently loaded in the standard loading system.
        // UnifiedCacheManager provides all necessary functionality for now.
        
        // Initialize registered core systems - only if not already initialized
        if (window.UnifiedInitializationSystem && !window.coreSystemsInitialized) {
            await window.UnifiedInitializationSystem.initializeCoreSystems();
            window.coreSystemsInitialized = true;
        } else if (window.coreSystemsInitialized) {
            console.log('✅ Core systems already initialized, skipping...');
        }
        
        // Final verification and reporting
        this.reportCacheSystemStatus();
    }
    
    /**
     * Report cache system status
     */
    reportCacheSystemStatus() {
        console.log('📊 Cache System Status:');
        console.log('================================');
        
        if (window.UnifiedCacheManager) {
            const status = window.UnifiedCacheManager.initialized ? '✅ Ready' : '⚠️ Not Initialized';
            console.log(`UnifiedCacheManager: ${status}`);
        } else {
            console.log('UnifiedCacheManager: ❌ Not Available');
        }
        
        console.log('================================');
        
        // Cache system is ready if UnifiedCacheManager is initialized
        window.cacheSystemReady = window.UnifiedCacheManager?.initialized || false;
        
        if (window.cacheSystemReady) {
            console.log('✅ Cache system ready (4-layer architecture)');
        } else {
            console.log('⚠️ Cache system not ready - using localStorage fallback');
        }
    }

    // REMOVED: Duplicate manualInitialization - see line 532 for the unified version

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
        console.log('🎉 Unified App Initialization Success!', {
            page: this.pageInfo.name,
            type: this.pageInfo.type,
            systems: this.availableSystems.size,
            totalTime: `${this.performanceMetrics.totalTime}ms`,
            stages: this.performanceMetrics.stageTimes
        });
        
        // Show success notification
        if (typeof window.showNotification === 'function') {
            window.showNotification('✅ המערכת אותחלה בהצלחה', 'success');
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
    }
}

// ===== GLOBAL INSTANCE =====

window.UnifiedAppInitializer = UnifiedAppInitializer;
window.unifiedAppInit = new UnifiedAppInitializer();

// ===== GLOBAL EXPORT =====

window.initializeUnifiedApp = async function() {
    return await window.unifiedAppInit.initialize();
};

window.getUnifiedAppStatus = function() {
    return window.unifiedAppInit.getStatus();
};

/**
 * Clear global initialization state (for testing/debugging)
 */
window.clearGlobalInitializationState = function() {
    window.globalInitializationState = {
        unifiedAppInitialized: false,
        unifiedAppInitializing: false,
        pageInitializers: new Set(),
        customInitializers: new Map()
    };
    console.log('🧹 Global initialization state cleared');
};

/**
 * Get global initialization state (for debugging)
 */
window.getGlobalInitializationState = function() {
    return {
        unifiedAppInitialized: window.globalInitializationState.unifiedAppInitialized,
        unifiedAppInitializing: window.globalInitializationState.unifiedAppInitializing,
        pageInitializersCount: window.globalInitializationState.pageInitializers.size,
        customInitializersCount: window.globalInitializationState.customInitializers.size,
        customInitializers: Array.from(window.globalInitializationState.customInitializers.entries())
    };
};

// ===== AUTO-INITIALIZATION =====

// Global initialization tracking to prevent double initialization
window.globalInitializationState = {
    unifiedAppInitialized: false,
    unifiedAppInitializing: false,
    pageInitializers: new Set(),
    customInitializers: new Map()
};

// Single DOMContentLoaded listener - replaces all others
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎯 DOM Content Loaded - Starting Unified App Initialization');
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 Current pathname:', window.location.pathname);
    
    // Prevent double initialization
    if (window.globalInitializationState.unifiedAppInitialized || 
        window.globalInitializationState.unifiedAppInitializing) {
        console.log('⚠️ Unified App already initialized or initializing, skipping...');
        return;
    }
    
    window.globalInitializationState.unifiedAppInitializing = true;
    
    try {
        // Small delay to ensure all scripts are loaded
        setTimeout(async () => {
            console.log('🚀 About to call initializeUnifiedApp...');
            await window.initializeUnifiedApp();
            window.globalInitializationState.unifiedAppInitialized = true;
            window.globalInitializationState.unifiedAppInitializing = false;
            console.log('✅ Unified App Initialization completed');
        }, 100);
        
    } catch (error) {
        console.error('❌ Unified App auto-initialization failed:', error);
        window.globalInitializationState.unifiedAppInitializing = false;
    }
});

// ===== ERROR HANDLING =====

window.addEventListener('error', (event) => {
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
        console.log(`📝 Registering core system: ${name}`);
        this.coreSystems.set(name, initFunction);
    },
    
    async initializeCoreSystems() {
        console.log('🔧 Initializing registered core systems...');
        for (const [name, initFunction] of this.coreSystems) {
            try {
                // בדיקה אם המערכת כבר מאותחלת
                const systemKey = name.toLowerCase().replace(/\s+/g, '');
                if (window[`${systemKey}Initialized`] || (window[name] && window[name].initialized)) {
                    console.log(`✅ ${name} already initialized, skipping...`);
                    continue;
                }
                
                console.log(`🔧 Initializing ${name}...`);
                await initFunction();
                // console.log(`✅ ${name} initialized successfully`);
            } catch (error) {
                console.error(`❌ Failed to initialize ${name}:`, error);
            }
        }
    }
};


// ===== NOTIFICATION SYSTEM ======
/**
 * Notification System - TikTrack
 * =============================
 *
 * מערכת התראות מרכזית לפרויקט TikTrack
 *
 * קובץ זה מכיל שלושה מערכות עיקריות:
 * 1. ALERTS SYSTEM - התראות עסקיות לתנאי שוק
 * 2. NOTIFICATION SYSTEM - הודעות מערכת למשוב משתמש
 * 3. LINKED ITEMS SYSTEM - הצגה וניהול פריטים מקושרים
 *
 * קובץ: trading-ui/scripts/notification-system.js
 * גרסה: 3.1
 * עדכון אחרון: 31 באוגוסט 2025
 *
 * תיקונים אחרונים (31 באוגוסט 2025):
 * - שיפור תמיכה בעמוד תכנונים
 * - תיקון הודעות הצלחה ושגיאה
 * - שיפור מערכת אישור מחיקה
 * - תמיכה במערכת ביטול תכנונים
 */

// Utility function to generate unique notification IDs
function generateNotificationId() {
  return Date.now() + Math.random();
}

/**
 * תלויות:
 * - linked-items.js (לפונקציות הצגת מודלים)
 * - Bootstrap 5.3.0 (לפונקציונליות מודלים)
 *
 * דוקומנטציה מפורטת: documentation/frontend/NOTIFICATION_SYSTEM.md
 */

// ===== ALERTS SYSTEM FUNCTIONS =====
// These functions handle business alerts for market conditions

/**
 * Create a new alert
 * ALERTS SYSTEM - Creates business alert for market conditions
 *
 * @param {Object} alertData - Alert data object
 * @returns {Promise} Promise that resolves when alert is created
 */
async function createAlert(alertData) {
  try {
    // שמירה במטמון מאוחד
    if (window.UnifiedCacheManager) {
      await window.UnifiedCacheManager.save('alerts-data', alertData, {
        syncToBackend: true,
        dependencies: ['accounts-data']
      });
    }
    
    // עדכון היסטוריית התראות
    await updateNotificationHistory('alert-created', alertData);
    
    console.log('✅ Alert created successfully');
  } catch (error) {
    console.error('❌ Failed to create alert:', error);
    throw error;
  }
}

/**
 * Update notification history
 * Updates notification history in unified cache
 *
 * @param {string} action - Action performed
 * @param {Object} data - Related data
 * @returns {Promise} Promise that resolves when history is updated
 */
async function updateNotificationHistory(action, data) {
  try {
    if (window.UnifiedCacheManager) {
      // קבלת היסטוריה קיימת
      let history = await window.UnifiedCacheManager.get('notifications-history', {
        fallback: () => []
      });
      
      if (!Array.isArray(history)) {
        history = [];
      }
      
      // הוספת רשומה חדשה
      const entry = {
        action,
        data,
        timestamp: Date.now(),
        id: Date.now() + Math.random()
      };
      
      history.unshift(entry); // הוספה לתחילת הרשימה
      
      // הגבלת גודל היסטוריה
      if (history.length > 1000) {
        history = history.slice(0, 1000);
      }
      
      // שמירה במטמון מאוחד
      await window.UnifiedCacheManager.save('notifications-history', history, {
        layer: 'indexedDB',
        compress: true,
        ttl: 86400000 // 24 שעות
      });
    }
  } catch (error) {
    console.error('❌ Failed to update notification history:', error);
  }
}


/**
 * Update an alert
 * ALERTS SYSTEM - Updates existing business alert
 *
 * @param {number} alertId - ID of alert to update
 * @param {Object} alertData - Updated alert data
 * @returns {Promise} Promise that resolves when alert is updated
 */
function updateAlert(_alertId, _alertData) {
  // Implementation for updating business alerts
  // TODO: Implement alert update logic
}

/**
 * Mark alert as triggered
 * ALERTS SYSTEM - Marks business alert as triggered when conditions are met
 *
 * @param {number} alertId - ID of alert to mark as triggered
 * @returns {Promise} Promise that resolves when alert is marked
 */
function markAlertAsTriggered(_alertId) {
  // Implementation for marking alerts as triggered
  // TODO: Implement alert trigger logic
}

/**
 * Mark alert as read
 * ALERTS SYSTEM - Marks business alert as read by user
 *
 * @param {number} alertId - ID of alert to mark as read
 * @returns {Promise} Promise that resolves when alert is marked
 */
function markAlertAsRead(_alertId) {
  // Implementation for marking alerts as triggered
  // TODO: Implement alert read logic
}


// ===== NOTIFICATION SYSTEM FUNCTIONS =====
// These functions handle system messages for user feedback

/**
 * Get notification icon based on type
 * NOTIFICATION SYSTEM - Returns appropriate FontAwesome icon for notification type
 *
 * @param {string} type - Type of notification (success, error, warning, info)
 * @returns {string} FontAwesome icon class
 */
function getNotificationIcon(type) {
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  return icons[type] || icons.info;
}

/**
 * Check if notification should be shown based on category preferences
 * NOTIFICATION SYSTEM - Checks user preferences for notification category
 *
 * @param {string} category - Category of notification (development, system, business, performance, ui)
 * @returns {Promise<boolean>} - Whether notification should be shown
 */
async function shouldShowNotification(category) {
  try {
    const preferenceName = `notifications_${category}_enabled`;
    console.log(`🔍 Checking preference: ${preferenceName}`);
    
    if (typeof window.getPreference !== 'function') {
      // Preferences system not loaded yet - show notifications by default (this is normal during initialization)
      return true;
    }
    
    const isEnabled = await window.getPreference(preferenceName);
    if (window.DEBUG_MODE) {
      console.log(`🔍 Preference ${preferenceName} value:`, isEnabled, typeof isEnabled);
    }
    
    // If preference is not found (null), don't show notification
    if (isEnabled === null) {
      console.log(`⚠️ Preference ${preferenceName} not found - notification disabled`);
      return false;
    }
    
    const result = isEnabled === 'true' || isEnabled === true;
    if (window.DEBUG_MODE) {
      console.log(`🔍 Should show notification for ${category}:`, result);
    }
    return result;
  } catch (error) {
    if (window.DEBUG_MODE) {
      console.warn('Failed to check notification preference, showing by default:', error);
    }
    // For general category, map to system category; for others, show by default
    if (category === 'general') {
      // Map general to system category since general doesn't exist
      return await shouldShowNotification('system');
    }
    return true; // Default: show notification
  }
}

/**
 * Check if console log should be written based on category preferences
 * NOTIFICATION SYSTEM - Checks user preferences for console log category
 *
 * @param {string} category - Category of log (development, system, business, performance, ui)
 * @returns {Promise<boolean>} - Whether log should be written to console
 */
async function shouldLogToConsole(category) {
  try {
    const preferenceName = `console_logs_${category}_enabled`;
    const isEnabled = await window.getPreference(preferenceName);
    return isEnabled === 'true' || isEnabled === true;
  } catch (error) {
    console.warn('Failed to check console log preference, logging by default:', error);
    return true; // Default: write to console
  }
}

/**
 * Log with category support
 * NOTIFICATION SYSTEM - Logs message to console with category filtering
 *
 * @param {string} level - Log level (log, warn, error, info)
 * @param {string} message - Message to log
 * @param {string} category - Category of log (development, system, business, performance, ui)
 * @param {any} details - Additional details to log
 */
async function logWithCategory(level, message, category = 'system', details = null) {
  if (await shouldLogToConsole(category)) {
    const emoji = getLogEmoji(level);
    const timestamp = new Date().toLocaleTimeString('he-IL');
    console[level](`${emoji} [${category.toUpperCase()}] ${timestamp}: ${message}`, details);
  }
}

/**
 * Get emoji for log level
 * NOTIFICATION SYSTEM - Returns appropriate emoji for log level
 *
 * @param {string} level - Log level
 * @returns {string} Emoji for log level
 */
function getLogEmoji(level) {
  const emojis = {
    log: '📝',
    warn: '⚠️',
    error: '❌',
    info: 'ℹ️'
  };
  return emojis[level] || '📝';
}

/**
 * Show a notification message
 * NOTIFICATION SYSTEM - Displays system notification to user
 *
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, warning, info)
 * @param {string} title - Optional title for the notification
 * @param {number} duration - Optional duration in milliseconds (default: 5000)
 * @param {string} category - Category of notification (development, system, business, performance, ui)
 */
async function showNotification(message, type = 'info', title = 'מערכת', duration = 5000, category = null) {
  // Auto-detect category if not provided
  if (!category && typeof window.detectNotificationCategory === 'function') {
    try {
      category = window.detectNotificationCategory(message, type, title, {
        fileName: window.location.pathname,
        functionName: 'showNotification',
        stackTrace: ''
      });
      // console.log(`🔍 Auto-detected category: ${category} for type: ${type}`);
    } catch (error) {
      console.warn('Failed to detect category, using default:', error);
      category = 'general';
    }
  } else if (!category) {
    // Fallback to type-based category
    switch (type) {
      case 'success': category = 'business'; break;
      case 'error': category = 'system'; break;
      case 'warning': category = 'system'; break;
      case 'info': category = 'ui'; break;
      default: category = 'general';
    }
  }
  
  // Check if notification should be shown based on category preferences
  console.log(`🔔 showNotification called: "${message}", type: ${type}, category: ${category}`);
  
  if (category) {
    try {
      const shouldShow = await shouldShowNotification(category);
      if (window.DEBUG_MODE) {
      console.log(`🔍 Category ${category} enabled:`, shouldShow);
    }
      if (!shouldShow) {
        console.log(`❌ Notification blocked for category: ${category}`);
        return; // Don't show notification if category is disabled
      }
    } catch (error) {
      console.warn('Failed to check notification category, showing anyway:', error);
      // Continue to show notification if category check fails
    }
  } else {
    console.log(`✅ Showing notification (category: ${category})`);
  }
  
  // Get dynamic colors from color scheme system
  const getNotificationColor = (type) => {
    if (typeof window.getEntityColor === 'function') {
      switch (type) {
        case 'success': return window.getEntityColor('account') || '#28a745';
        case 'error': return window.getEntityColor('ticker') || '#dc3545';
        case 'warning': return window.getEntityColor('alert') || '#ffc107';
        case 'info': return window.getEntityColor('execution') || '#17a2b8';
        default: return '#6c757d';
      }
    }
    // Fallback to default colors
    switch (type) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const notificationColor = getNotificationColor(type);
  
  // Debug: Log dynamic color
  // console.log(`🎨 Dynamic notification color for ${type}:`, notificationColor);
  // console.log(`🎨 getEntityColor function available:`, typeof window.getEntityColor);

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.borderLeft = `4px solid ${notificationColor}`;
  notification.innerHTML = `
    <div class="notification-icon" style="color: ${notificationColor}">
      <i class="fas ${getNotificationIcon(type)}"></i>
    </div>
    <div class="notification-content">
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
    </div>
    <button class="notification-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;

  // Debug: Log notification element details
  // console.log('🔍 DEBUG: Notification element created:', {
  //   element: notification,
  //   className: notification.className,
  //   type: type,
  //   innerHTML: notification.innerHTML.substring(0, 200) + '...'
  // });

  // Debug: Check computed styles
  setTimeout(() => {
    const computedStyle = window.getComputedStyle(notification);
    const titleElement = notification.querySelector('.notification-title');
    const messageElement = notification.querySelector('.notification-message');
    const iconElement = notification.querySelector('.notification-icon');
    
    // console.log('🔍 DEBUG: Computed styles after creation:', {
    //   notification: {
    //     backgroundColor: computedStyle.backgroundColor,
    //     color: computedStyle.color,
    //     borderColor: computedStyle.borderColor,
    //     display: computedStyle.display,
    //     opacity: computedStyle.opacity
    //   },
    //   title: titleElement ? {
    //     color: window.getComputedStyle(titleElement).color,
    //     fontSize: window.getComputedStyle(titleElement).fontSize,
    //     fontWeight: window.getComputedStyle(titleElement).fontWeight
    //   } : 'No title element',
    //   message: messageElement ? {
    //     color: window.getComputedStyle(messageElement).color,
    //     fontSize: window.getComputedStyle(messageElement).fontSize
    //   } : 'No message element',
    //   icon: iconElement ? {
    //     color: window.getComputedStyle(iconElement).color,
    //     fontSize: window.getComputedStyle(iconElement).fontSize
    //   } : 'No icon element'
    // });
    
    // Debug: Check if CSS file is loaded - DISABLED FOR PERFORMANCE
    // const stylesheets = Array.from(document.styleSheets);
    // const notificationCSS = stylesheets.find(sheet => {
    //   try {
    //     return sheet.href && sheet.href.includes('_notifications.css');
    //   } catch (e) {
    //     return false;
    //   }
    // });
    // console.log('🔍 DEBUG: CSS file check:', {
    //   totalStylesheets: stylesheets.length,
    //   notificationCSSLoaded: !!notificationCSS,
    //   notificationCSSUrl: notificationCSS ? notificationCSS.href : 'Not found'
    // });
    
    // Debug: Check CSS rules - DISABLED FOR PERFORMANCE
    // if (notificationCSS) {
    //   try {
    //     const rules = Array.from(notificationCSS.cssRules || notificationCSS.rules || []);
    //     const notificationRules = rules.filter(rule => 
    //       rule.selectorText && rule.selectorText.includes('.notification')
    //     );
    //     console.log('🔍 DEBUG: CSS rules check:', {
    //       totalRules: rules.length,
    //       notificationRules: notificationRules.length,
    //       notificationSelectors: notificationRules.map(rule => rule.selectorText)
    //     });
        
        // Debug: Check specific rules - DISABLED FOR PERFORMANCE
        // const titleRulesDebug = rules.filter(rule => 
        //   rule.selectorText && rule.selectorText.includes('.notification-title')
        // );
        // const messageRulesDebug = rules.filter(rule => 
        //   rule.selectorText && rule.selectorText.includes('.notification-message')
        // );
        // console.log('🔍 DEBUG: Specific rules check:', {
        //   titleRules: titleRulesDebug.length,
        //   messageRules: messageRulesDebug.length,
        //   titleSelectors: titleRulesDebug.map(rule => rule.selectorText),
        //   messageSelectors: messageRulesDebug.map(rule => rule.selectorText)
        // });
        
        // Debug: Check if !important rules are loaded - DISABLED FOR PERFORMANCE
        // const importantRules = rules.filter(rule => 
        //   rule.cssText && rule.cssText.includes('!important')
        // );
        // console.log('🔍 DEBUG: Important rules check:', {
        //   importantRulesCount: importantRules.length,
        //   importantRules: importantRules.map(rule => rule.selectorText + ' -> ' + rule.cssText.substring(0, 100))
        // });
        
        // Debug: Check specific color rules - DISABLED FOR PERFORMANCE
        // const colorRules = rules.filter(rule => 
        //   rule.cssText && (rule.cssText.includes('color:') || rule.cssText.includes('color :'))
        // );
        // console.log('🔍 DEBUG: Color rules check:', {
        //   colorRulesCount: colorRules.length,
        //   colorRules: colorRules.map(rule => rule.selectorText + ' -> ' + rule.cssText.substring(0, 150))
        // });
        
        // Debug: Check if our specific rules are loaded - DISABLED FOR PERFORMANCE
        // const ourRules = rules.filter(rule => 
        //   rule.cssText && (rule.cssText.includes('#1a1a1a') || rule.cssText.includes('#666'))
        // );
        // console.log('🔍 DEBUG: Our specific rules check:', {
        //   ourRulesCount: ourRules.length,
        //   ourRules: ourRules.map(rule => rule.selectorText + ' -> ' + rule.cssText.substring(0, 150))
        // });
        
        // Debug: Check the actual computed colors - DISABLED FOR PERFORMANCE
        // console.log('🔍 DEBUG: Actual computed colors:', {
        //   titleColor: titleElement ? window.getComputedStyle(titleElement).color : 'No title',
        //   messageColor: messageElement ? window.getComputedStyle(messageElement).color : 'No message',
        //   iconColor: iconElement ? window.getComputedStyle(iconElement).color : 'No icon'
        // });
        
        // Debug: Check specific CSS rules for our selectors - DISABLED FOR PERFORMANCE
        // const titleRulesDetailed = rules.filter(rule => 
        //   rule.selectorText && rule.selectorText.includes('.notification-title')
        // );
        // const messageRulesDetailed = rules.filter(rule => 
        //   rule.selectorText && rule.selectorText.includes('.notification-message')
        // );
        // console.log('🔍 DEBUG: Detailed CSS rules:', {
        //   titleRules: titleRulesDetailed.map(rule => rule.selectorText + ' -> ' + rule.cssText),
        //   messageRules: messageRulesDetailed.map(rule => rule.selectorText + ' -> ' + rule.cssText)
        // });
        
        // Debug: Check if Bootstrap is overriding our styles - DISABLED FOR PERFORMANCE
        // const bootstrapRules = rules.filter(rule => 
        //   rule.selectorText && (rule.selectorText.includes('.text-') || rule.selectorText.includes('.text-') || rule.selectorText.includes('body') || rule.selectorText.includes('*'))
        // );
        // console.log('🔍 DEBUG: Bootstrap/Global rules that might override:', {
        //   bootstrapRulesCount: bootstrapRules.length,
        //   bootstrapRules: bootstrapRules.slice(0, 5).map(rule => rule.selectorText + ' -> ' + rule.cssText.substring(0, 100))
        // });
      // } catch (e) {
      //   console.log('🔍 DEBUG: Cannot access CSS rules:', e.message);
      // }
    // }
  }, 100);

  // Add to page
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
    // console.log('🔍 DEBUG: Created notification container:', container);
  }
  
  container.appendChild(notification);
  // console.log('🔍 DEBUG: Notification added to container:', {
  //   container: container,
  //   notification: notification,
  //   containerChildren: container.children.length
  // });

  // Trigger animation
  setTimeout(() => {
    notification.classList.add('show');
    // console.log('🔍 DEBUG: Animation triggered, notification classes:', notification.className);
  }, 10);

  // Auto remove after duration
  setTimeout(() => {
    if (notification.parentElement) {
      // console.log('🔍 DEBUG: Starting notification removal, classes:', notification.className);
      notification.classList.add('hide');
      setTimeout(() => {
        if (notification.parentElement) {
          // console.log('🔍 DEBUG: Removing notification from DOM');
          notification.remove();
        }
      }, 300); // Wait for animation
    }
  }, duration);

  // Save to global history
  saveNotificationToGlobalHistory(type, title, message, category).catch(error => {
    console.warn('Failed to save notification to global history:', error);
  });

  // Console log for debugging
  console.log(`🔔 ${type.toUpperCase()}: ${title} - ${message}`);
}

/**
 * Get notification icon based on type
 */
// Function already defined above

// ייצוא הפונקציה הגלובלית - יועבר למטה

// ===== LINKED ITEMS SYSTEM FUNCTIONS =====
// These functions handle linked items display and management


/**
 * Load linked items data from server
 * LINKED ITEMS SYSTEM - Fetches linked items data for any entity type
 *
 * @param {string} itemType - Type of the item
 * @param {number|string} itemId - ID of the item
 * @returns {Object} Linked items data
 */
async function loadLinkedItemsData(itemType, itemId) {
  const response = await fetch(`/api/linked-items/${itemType}/${itemId}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Create notification container if not exists
 * NOTIFICATION SYSTEM - Creates container for system notifications
 *
 * @returns {HTMLElement} Notification container element
 */
function createNotificationContainer() {
  console.log('🔧 createNotificationContainer נקרא');
  let container = document.getElementById('notification-container');
  console.log('🔍 קונטיינר קיים?', !!container);

  if (!container) {
    console.log('🔧 יוצר קונטיינר חדש...');
    container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
    console.log('✅ קונטיינר נוצר ונוסף ל-DOM');
    
    // בדיקת סגנונות מחושבים
    const computedStyle = window.getComputedStyle(container);
    console.log('🔍 סגנונות מחושבים לקונטיינר:');
    console.log('  position:', computedStyle.position);
    console.log('  top:', computedStyle.top);
    console.log('  right:', computedStyle.right);
    console.log('  z-index:', computedStyle.zIndex);
    console.log('  max-width:', computedStyle.maxWidth);
    
    // בדיקת טעינת CSS
    console.log('🔍 בדיקת טעינת CSS:');
    const styleSheets = Array.from(document.styleSheets);
    const headerCss = styleSheets.find(sheet => 
      sheet.href && sheet.href.includes('header-styles.css')
    );
    console.log('  header-styles.css נטען?', !!headerCss);
    if (headerCss) {
      console.log('  header-styles.css URL:', headerCss.href);
    }
    
    // בדיקת סגנונות notification-container
    const notificationStyles = Array.from(styleSheets).map(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        return rules.filter(rule => 
          rule.selectorText && rule.selectorText.includes('notification-container')
        );
      } catch (e) {
        return [];
      }
    }).flat();
    console.log('  סגנונות notification-container נמצאו:', notificationStyles.length);
    notificationStyles.forEach(rule => {
      console.log('    כלל:', rule.selectorText);
    });
  } else {
    console.log('✅ קונטיינר קיים');
  }

  console.log('🔍 קונטיינר סופי:', container);
  return container;
}


/**
 * Hide notification with animation
 * NOTIFICATION SYSTEM - Hides system notification with smooth animation
 *
 * @param {HTMLElement} notification - Notification element to hide
 */
function hideNotification(notification) {
  if (notification && notification.parentElement) {
    notification.classList.add('hide');

    // Remove from DOM after animation
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 300);
  }
}

// This function is already defined above - removing duplicate

// ===== SPECIFIC NOTIFICATION FUNCTIONS =====
// These are convenience functions for different notification types

/**
 * Show success notification
 * NOTIFICATION SYSTEM - Displays success message to user
 *
 * @param {string} title - Success notification title
 * @param {string} message - Success notification message
 * @param {number} duration - Display duration in milliseconds (default: 4000)
 * @param {string} category - Category of notification (default: 'system')
 */
async function showSuccessNotification(title, message, duration = 4000, category = null) {
  // Ensure title and message are provided
  const finalTitle = title || 'הצלחה';
  const finalMessage = message || 'הפעולה הושלמה בהצלחה';

  // showSuccessNotification calling showNotification with category
  await showNotification(finalMessage, 'success', finalTitle, duration, category);
}


/**
 * Show error notification
 * NOTIFICATION SYSTEM - Displays error message to user
 *
 * @param {string} title - Error notification title
 * @param {string} message - Error notification message
 * @param {number} duration - Display duration in milliseconds (default: 6000)
 * @param {string} category - Category of notification (default: 'system')
 */
async function showErrorNotification(title, message, duration = 6000, category = null) {
  // Use the new critical error system for all error notifications
  console.log('🚨 Error notification converted to critical error system:', { title, message, category });
  
  // Get current function name from stack trace
  const stack = new Error().stack;
  const stackLines = stack.split('\n');
  const callerLine = stackLines[2] || stackLines[1] || '';
  
  // Extract function name and line number
  const functionMatch = callerLine.match(/at\s+(\w+)/);
  const lineMatch = callerLine.match(/:(\d+):/);
  
  const errorDetails = {
    source: 'error-notification',
    function: functionMatch ? functionMatch[1] : 'unknown',
    line: lineMatch ? lineMatch[1] : 'unknown',
    stack: stack,
    originalDuration: duration,
    originalCategory: category,
    convertedAt: new Date().toISOString()
  };
  
  // Show critical error notification instead of regular notification
  await showCriticalErrorNotification(title, message, errorDetails, category || 'system');
}

/**
 * Show simple error notification (legacy mode)
 * NOTIFICATION SYSTEM - Displays simple error notification without modal
 *
 * @param {string} title - Error notification title
 * @param {string} message - Error notification message
 * @param {number} duration - Display duration in milliseconds (default: 6000)
 * @param {string} category - Category of notification (default: 'system')
 */
async function showSimpleErrorNotification(title, message, duration = 6000, category = null) {
  // Use the original simple notification system
  await showNotification(message, 'error', title, duration, category);
}

/**
 * Show final success notification with detailed logging
 * NOTIFICATION SYSTEM - Displays final success for process completion that requires user acknowledgment
 *
 * @param {string} title - Final success notification title
 * @param {string} message - Final success notification message
 * @param {Object} details - Additional success details (optional)
 * @param {string} category - Category of notification (default: 'system')
 */
async function showFinalSuccessNotification(title, message, details = {}, category = 'system') {
  console.log('🎉 Final success notification:', { title, message, details, category });
  
  // Collect detailed success information
  const successInfo = {
    title,
    message,
    details,
    category,
    timestamp: new Date().toISOString(),
    type: 'critical-success',
    id: generateNotificationId()
  };
  
  // Add browser and system information
  successInfo.browser = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine
  };
  
  successInfo.system = {
    screenWidth: screen.width,
    screenHeight: screen.height,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
  
  // Add performance information if available
  if (performance.memory) {
    successInfo.performance = {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
    };
  }
  
  // Save to history
  saveNotificationToGlobalHistory('success', title, message, category);
  
  // Show modal with detailed information
  showFinalSuccessModal(successInfo);
  
  // Log to console with full details
  console.group('🎉 Final Success Details');
  console.log('Title:', title);
  console.log('Message:', message);
  console.log('Category:', category);
  console.log('Details:', details);
  console.log('Full Success Object:', successInfo);
  console.groupEnd();
  
  return successInfo;
}

/**
 * Show critical error notification with detailed logging
 * NOTIFICATION SYSTEM - Displays critical error that requires user action
 *
 * @param {string} title - Error notification title
 * @param {string} message - Error notification message
 * @param {Object} details - Additional error details (optional)
 * @param {string} category - Category of notification (default: 'system')
 */
async function showCriticalErrorNotification(title, message, details = {}, category = 'system') {
  console.log('🚨 Critical error notification:', { title, message, details, category });
  
  // Collect detailed error information
  const errorInfo = {
    title,
    message,
    details,
    category,
    timestamp: new Date().toISOString(),
    page: window.location.pathname,
    url: window.location.href,
    userAgent: navigator.userAgent,
    stack: details.stack || new Error().stack,
    source: details.source || 'unknown',
    function: details.function || 'unknown',
    line: details.line || 'unknown'
  };
  
  // Create detailed error message for logging
  const detailedMessage = createDetailedErrorMessage(errorInfo);
  
  // Show modal with error details
  await showCriticalErrorModal(errorInfo, detailedMessage);
}

/**
 * Create detailed error message for logging
 * NOTIFICATION SYSTEM - Formats error information for detailed logging
 *
 * @param {Object} errorInfo - Error information object
 * @returns {string} Formatted error message
 */
function createDetailedErrorMessage(errorInfo) {
  const lines = [
    '=== CRITICAL ERROR REPORT ===',
    `Timestamp: ${errorInfo.timestamp}`,
    `Page: ${errorInfo.page}`,
    `URL: ${errorInfo.url}`,
    `Title: ${errorInfo.title}`,
    `Message: ${errorInfo.message}`,
    `Category: ${errorInfo.category}`,
    `Source: ${errorInfo.source}`,
    `Function: ${errorInfo.function}`,
    `Line: ${errorInfo.line}`,
    '',
    '=== DETAILS ===',
    JSON.stringify(errorInfo.details, null, 2),
    '',
    '=== STACK TRACE ===',
    errorInfo.stack,
    '',
    '=== BROWSER INFO ===',
    `User Agent: ${errorInfo.userAgent}`,
    `Screen: ${screen.width}x${screen.height}`,
    `Viewport: ${window.innerWidth}x${window.innerHeight}`,
    `Language: ${navigator.language}`,
    `Platform: ${navigator.platform}`,
    '',
    '=== END OF REPORT ==='
  ];
  
  return lines.join('\n');
}

/**
 * Show critical error modal with copy functionality
 * NOTIFICATION SYSTEM - Displays modal with error details and copy button
 *
 * @param {Object} errorInfo - Error information object
 * @param {string} detailedMessage - Detailed error message for copying
 */
/**
 * Show Clear Cache Confirmation Modal
 * Returns a promise that resolves to true/false based on user choice
 * 
 * @param {string} level - 'light'|'medium'|'full'|'nuclear'
 * @param {Object} currentStats - Current cache statistics
 * @returns {Promise<boolean>} User confirmation
 */
window.showClearCacheConfirmation = async function(level, currentStats) {
    return new Promise((resolve) => {
        const levelConfig = {
            'light': {
                emoji: '🟢',
                name: 'Light - ניקוי קל',
                color: '#28a745',
                warning: 'ניקוי קל - בטוח למבחנים',
                items: [
                    `✅ Memory Layer: ${currentStats.memory?.entries || 0} entries`,
                    `✅ Service Caches: ~7-9 services`,
                    `❌ localStorage: ${currentStats.localStorage?.entries || 0} entries (ישארו)`,
                    `❌ Orphan Keys: ~15-20 keys (ישארו)`
                ],
                safety: 'גבוהה',
                reversible: 'כן'
            },
            'medium': {
                emoji: '🔵',
                name: 'Medium - ניקוי בינוני',
                color: '#007bff',
                warning: 'ניקוי בינוני - מומלץ לפיתוח יומיומי',
                items: [
                    `✅ כל Light (Memory + Services)`,
                    `✅ localStorage tiktrack_*: ${currentStats.localStorage?.entries || 0} entries`,
                    `✅ IndexedDB store: ${currentStats.indexedDB?.entries || 0} entries`,
                    `✅ Backend layer: ${currentStats.backend?.entries || 0} entries`,
                    `❌ Orphan Keys: ~15-20 keys (ישארו)`
                ],
                safety: 'בינונית',
                reversible: 'חלקי'
            },
            'full': {
                emoji: '🟠',
                name: 'Full - ניקוי מלא',
                color: '#fd7e14',
                warning: 'ניקוי מלא - כולל orphans וauth keys!',
                items: [
                    `✅ כל Medium`,
                    `✅ Orphan Keys: ~15-20 keys`,
                    `⚠️ כולל: authToken, currentUser`,
                    `⚠️ כולל: colorScheme, preferences`
                ],
                safety: 'נמוכה',
                reversible: 'לא'
            },
            'nuclear': {
                emoji: '☢️',
                name: 'Nuclear - גרעיני',
                color: '#dc3545',
                warning: '⚠️⚠️⚠️ אזהרה קריטית! מוחק הכל!',
                items: [
                    `☢️ כל Full`,
                    `☢️ ALL localStorage (כולל non-TikTrack!)`,
                    `☢️ DELETE UnifiedCacheDB database`,
                    `☢️ sessionStorage`,
                    `⚠️ דורש: refresh + login + setup מחדש`
                ],
                safety: 'אפס',
                reversible: 'לא - בלתי הפיך!'
            }
        };
        
        const config = levelConfig[level] || levelConfig['medium'];
        const totalEntries = (currentStats.memory?.entries || 0) + 
                            (currentStats.localStorage?.entries || 0) + 
                            (currentStats.indexedDB?.entries || 0) + 
                            (currentStats.backend?.entries || 0);
        
        // Create modal HTML
        const modalHtml = `
            <div class="modal fade" id="clearCacheConfirmationModal" tabindex="-1" data-bs-backdrop="static">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header text-white" style="background-color: ${config.color}; direction: rtl;">
                            <h4 class="modal-title">
                                ${config.emoji} ${config.name}
                            </h4>
                        </div>
                        <div class="modal-body" style="direction: rtl;">
                            <div class="alert alert-${level === 'nuclear' ? 'danger' : level === 'full' ? 'warning' : 'info'}">
                                <i class="fas fa-exclamation-triangle"></i>
                                <strong>${config.warning}</strong>
                            </div>
                            
                            <h5>מה ינוקה:</h5>
                            <ul style="text-align: right;">
                                ${config.items.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                            
                            <div class="row mt-3">
                                <div class="col-md-4">
                                    <div class="stat-box text-center p-2 border rounded">
                                        <small class="text-muted">סה"כ נוכחי:</small>
                                        <h5 class="mb-0">${totalEntries} entries</h5>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="stat-box text-center p-2 border rounded">
                                        <small class="text-muted">בטיחות:</small>
                                        <h5 class="mb-0">${config.safety}</h5>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="stat-box text-center p-2 border rounded">
                                        <small class="text-muted">הפיך:</small>
                                        <h5 class="mb-0">${config.reversible}</h5>
                                    </div>
                                </div>
                            </div>
                            
                            ${level === 'full' || level === 'nuclear' ? `
                            <div class="alert alert-danger mt-3">
                                <i class="fas fa-exclamation-circle"></i>
                                <strong>שים לב:</strong>
                                ${level === 'full' ? 'פעולה זו תמחק את authToken ו-currentUser - ידרוש login מחדש!' : 
                                                     'פעולה זו בלתי הפיכה ותמחק גם נתונים של אתרים אחרים ב-localhost!'}
                            </div>
                            ` : ''}
                        </div>
                        <div class="modal-footer" style="direction: rtl;">
                            <button type="button" class="btn btn-secondary" id="clearCache-cancel-btn">
                                ביטול
                            </button>
                            <button type="button" class="btn btn-${level === 'nuclear' ? 'danger' : level === 'full' ? 'warning' : 'primary'}" id="clearCache-confirm-btn">
                                ${config.emoji} ${level === 'nuclear' ? 'כן, מחק הכל' : level === 'full' ? 'אני מבין - מחק הכל' : 'אישור'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existing = document.getElementById('clearCacheConfirmationModal');
        if (existing) existing.remove();
        
        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modalElement = document.getElementById('clearCacheConfirmationModal');
        const modal = new bootstrap.Modal(modalElement);
        
        // Confirm button
        document.getElementById('clearCache-confirm-btn').onclick = () => {
            modal.hide();
            setTimeout(() => modalElement.remove(), 300);
            resolve(true);
        };
        
        // Cancel button
        document.getElementById('clearCache-cancel-btn').onclick = () => {
            modal.hide();
            setTimeout(() => modalElement.remove(), 300);
            resolve(false);
        };
        
        // Show modal
        modal.show();
    });
};

/**
 * Show final success modal with detailed information
 * NOTIFICATION SYSTEM - Displays modal with final success details and requires user acknowledgment
 *
 * @param {Object} successInfo - Success information object
 */
function showFinalSuccessModal(successInfo) {
  console.log('🔍 showFinalSuccessModal called:', { successInfo });
  
  // Create modal HTML
  // Note: Don't add aria-hidden or inert - let Bootstrap manage these automatically
  const modalHtml = `
    <div class="modal fade" id="finalSuccessModal" tabindex="-1" aria-labelledby="finalSuccessModalLabel">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header text-white d-flex justify-content-between align-items-center" style="direction: rtl; background-color: #28a745;">
            <h4 class="modal-title fw-bold" id="finalSuccessModalLabel">
              <i class="fas fa-check-circle"></i> ${successInfo.title}
            </h4>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-sm btn-light" id="finalSuccessModal-copy-btn" title="העתק פרטים ללוח">
                <i class="fas fa-copy"></i> העתק
              </button>
              <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal" title="סגור">
                <i class="fas fa-times"></i> סגור
              </button>
            </div>
          </div>
          <div class="modal-body">
            <div class="alert alert-success" role="alert">
              <h6 class="alert-heading">
                <i class="fas fa-check-circle"></i> ${successInfo.message}
              </h6>
              <hr>
              <p class="mb-0">
                <strong>זמן:</strong> ${new Date(successInfo.timestamp).toLocaleString('he-IL')}<br>
                <strong>קטגוריה:</strong> ${successInfo.category}<br>
                <strong>מזהה:</strong> ${successInfo.id}
              </p>
            </div>
            
            <div class="row">
              <div class="col-md-6">
                <h6><i class="fas fa-info-circle text-success"></i> פרטי הצלחה:</h6>
                <pre class="bg-light p-2 rounded" style="font-size: 0.8rem; max-height: 200px; overflow-y: auto;">${JSON.stringify(successInfo.details, null, 2)}</pre>
              </div>
              <div class="col-md-6">
                <h6><i class="fas fa-desktop text-success"></i> מידע מערכת:</h6>
                <pre class="bg-light p-2 rounded" style="font-size: 0.8rem; max-height: 200px; overflow-y: auto;">${JSON.stringify({
                  browser: successInfo.browser,
                  system: successInfo.system,
                  performance: successInfo.performance
                }, null, 2)}</pre>
              </div>
            </div>
          </div>
          <div class="modal-footer" style="justify-content: flex-end; direction: rtl;">
            <button type="button" class="btn btn-success" data-bs-dismiss="modal">
              <i class="fas fa-check"></i> הבנתי
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Remove existing modal if present
  const existingModal = document.getElementById('finalSuccessModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // Show modal
  const modalElement = document.getElementById('finalSuccessModal');
  
  // Configure modal with focus: false to prevent auto-focus on buttons
  const modal = new bootstrap.Modal(modalElement, {
    focus: false  // Prevent Bootstrap from auto-focusing buttons
  });
  
  modal.show();
  
  // Fix ARIA accessibility: Bootstrap still adds aria-hidden, remove it
  // Using requestAnimationFrame for better timing than setTimeout
  requestAnimationFrame(() => {
    modalElement.removeAttribute('aria-hidden');
    modalElement.removeAttribute('inert');
  });
  
  // Store success info globally for copying
  window.currentSuccessInfo = successInfo;
  
  // Add copy button functionality
  const copyButton = document.getElementById('finalSuccessModal-copy-btn');
  if (copyButton) {
    copyButton.addEventListener('click', () => {
      copySuccessDetails();
    });
  }
}

async function showCriticalErrorModal(errorInfo, detailedMessage) {
  console.log('🔍 showCriticalErrorModal called:', { errorInfo, detailedMessage });
  
  // Close any existing modals
  closeAllDetailsModals();
  
  // Create unique modal ID
  const modalId = `critical-error-modal-${Date.now()}`;
  
  // Create modal HTML
  const modalHTML = `
    <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}-label">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header text-white d-flex justify-content-between align-items-center" style="direction: rtl; background-color: #dc3545;">
            <h4 class="modal-title fw-bold" id="${modalId}-label">
              <i class="fas fa-exclamation-triangle"></i> ${errorInfo.title}
            </h4>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-sm btn-warning" id="${modalId}-copy-btn" title="העתק פרטי שגיאה">
                <i class="fas fa-copy"></i> העתק
              </button>
              <button type="button" class="btn btn-sm btn-secondary" id="${modalId}-close-btn" title="סגור">
                <i class="fas fa-times"></i> סגור
              </button>
            </div>
          </div>
          <div class="modal-body">
            <div class="alert alert-danger" role="alert">
              <h5 class="alert-heading">
                <i class="fas fa-exclamation-circle"></i> שגיאה קריטית
              </h5>
              <p class="mb-0">${errorInfo.message}</p>
            </div>
            
            <div class="error-details">
              <h6><i class="fas fa-info-circle"></i> פרטים נוספים:</h6>
              <div class="row">
                <div class="col-md-6">
                  <p><strong>עמוד:</strong> ${errorInfo.page}</p>
                  <p><strong>מקור:</strong> ${errorInfo.source}</p>
                  <p><strong>פונקציה:</strong> ${errorInfo.function}</p>
                </div>
                <div class="col-md-6">
                  <p><strong>שורה:</strong> ${errorInfo.line}</p>
                  <p><strong>קטגוריה:</strong> ${errorInfo.category}</p>
                  <p><strong>זמן:</strong> ${new Date(errorInfo.timestamp).toLocaleString('he-IL')}</p>
                </div>
              </div>
              
              ${Object.keys(errorInfo.details).length > 0 ? `
                <h6><i class="fas fa-list"></i> פרטים נוספים:</h6>
                <pre class="bg-light p-3 rounded"><code>${JSON.stringify(errorInfo.details, null, 2)}</code></pre>
              ` : ''}
            </div>
          </div>
          <div class="modal-footer" style="justify-content: flex-end; direction: rtl;">
            <button type="button" class="btn btn-warning" id="${modalId}-copy-details-btn">
              <i class="fas fa-copy"></i> העתק פרטי שגיאה
            </button>
            <button type="button" class="btn btn-secondary" id="${modalId}-footer-close">
              <i class="fas fa-times"></i> סגור
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Get modal element
  const modal = document.getElementById(modalId);
  
  // Show modal using simple system (no Bootstrap dependency)
  modal.style.display = 'block';
  modal.classList.add('show');
  document.body.classList.add('modal-open');
  
  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop fade show';
  backdrop.id = `${modalId}-backdrop`;
  document.body.appendChild(backdrop);
  
  // Copy button in header
  const copyButton = modal.querySelector(`#${modalId}-copy-btn`);
  if (copyButton) {
    copyButton.addEventListener('click', () => {
      copyToClipboard(detailedMessage, errorInfo.title);
    });
  }
  
  // Copy button in footer
  const copyDetailsButton = modal.querySelector(`#${modalId}-copy-details-btn`);
  if (copyDetailsButton) {
    copyDetailsButton.addEventListener('click', () => {
      copyToClipboard(detailedMessage, errorInfo.title);
    });
  }
  
  // Close button in header
  const headerCloseButton = modal.querySelector(`#${modalId}-close-btn`);
  if (headerCloseButton) {
    headerCloseButton.addEventListener('click', () => {
      hideModal(modalId);
    });
  }
  
  // Close button in footer
  const footerCloseBtn = modal.querySelector(`#${modalId}-footer-close`);
  if (footerCloseBtn) {
    footerCloseBtn.addEventListener('click', () => {
      hideModal(modalId);
    });
  }
  
  console.log('✅ Critical error modal shown:', modalId);
}

/**
 * Helper function to create critical error with automatic context detection
 * NOTIFICATION SYSTEM - Automatically detects context and creates detailed error
 *
 * @param {string} title - Error title
 * @param {string} message - Error message
 * @param {Object} additionalDetails - Additional error details (optional)
 * @param {string} category - Error category (default: 'system')
 */
function createCriticalError(title, message, additionalDetails = {}, category = 'system') {
  // Get current function name from stack trace
  const stack = new Error().stack;
  const stackLines = stack.split('\n');
  const callerLine = stackLines[2] || stackLines[1] || '';
  
  // Extract function name and line number
  const functionMatch = callerLine.match(/at\s+(\w+)/);
  const lineMatch = callerLine.match(/:(\d+):/);
  
  const errorDetails = {
    source: 'automatic-detection',
    function: functionMatch ? functionMatch[1] : 'unknown',
    line: lineMatch ? lineMatch[1] : 'unknown',
    stack: stack,
    ...additionalDetails
  };
  
  // Show critical error notification
  showCriticalErrorNotification(title, message, errorDetails, category);
}

/**
 * Helper function to wrap existing functions with critical error handling
 * NOTIFICATION SYSTEM - Wraps functions to automatically show critical errors on failure
 *
 * @param {Function} func - Function to wrap
 * @param {string} errorTitle - Error title for critical errors
 * @param {string} errorMessage - Error message for critical errors
 * @returns {Function} Wrapped function
 */
function withCriticalErrorHandling(func, errorTitle = 'שגיאה קריטית', errorMessage = 'אירעה שגיאה קריטית') {
  return async function(...args) {
    try {
      return await func.apply(this, args);
    } catch (error) {
      console.error('Critical error caught:', error);
      
      const errorDetails = {
        source: 'error-handler',
        function: func.name || 'anonymous',
        line: 'wrapped-function',
        stack: error.stack,
        originalError: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        arguments: args
      };
      
      showCriticalErrorNotification(errorTitle, errorMessage, errorDetails, 'system');
      
      // Re-throw the error to maintain normal error flow
      throw error;
    }
  };
}

/**
 * Show warning notification
 * NOTIFICATION SYSTEM - Displays warning message to user
 *
 * @param {string} title - Warning notification title
 * @param {string} message - Warning notification message
 * @param {number} duration - Display duration in milliseconds (default: 5000)
 * @param {string} category - Category of notification (default: 'system')
 */
async function showWarningNotification(title, message, duration = 5000, category = null) {
  // showWarningNotification calling showNotification with category
  await showNotification(message, 'warning', title, duration, category);
}

/**
 * Show info notification
 * NOTIFICATION SYSTEM - Displays info message to user
 *
 * @param {string} title - Info notification title
 * @param {string} message - Info notification message
 * @param {number} duration - Display duration in milliseconds (default: 4000)
 * @param {string} category - Category of notification (default: 'system')
 */
async function showInfoNotification(title, message, duration = 4000, category = null) {
  // showInfoNotification calling showNotification with category
  await showNotification(message, 'info', title, duration, category);
}

/**
 * Show details modal
 * NOTIFICATION SYSTEM - Displays details in a modal dialog
 *
 * @param {string} title - Modal title
 * @param {string} content - Modal content (HTML or text)
 * @param {Object} options - Additional options
 */
async function showDetailsModal(title, content, options = {}) {
  console.log('🔍 showDetailsModal called:', { title, content, options });
  
  // סגירת כל החלונות הקודמים
  closeAllDetailsModals();
  
  // Create unique modal ID
  const modalId = `details-modal-${Date.now()}`;
  
  // Extract text content for copying
  const textContent = extractTextFromHTML(content);
  
  // Create modal HTML
  const modalHTML = `
    <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}-label">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header text-white d-flex justify-content-between align-items-center" style="direction: rtl; background-color: ${window.getEntityColor ? window.getEntityColor('trade') || '#007bff' : '#007bff'};">
            <h4 class="modal-title fw-bold" id="${modalId}-label">${title}</h4>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-sm btn-secondary" id="${modalId}-close-btn" title="סגור">
                X
              </button>
            </div>
          </div>
          <div class="modal-body">
            <div class="details-content">
              ${content}
            </div>
          </div>
          <div class="modal-footer" style="justify-content: flex-end; direction: rtl;">
            <button type="button" class="btn btn-secondary" id="${modalId}-footer-close">סגור</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Get modal element
  const modal = document.getElementById(modalId);
  
  // Ensure content is properly rendered as HTML
  const detailsContent = modal.querySelector('.details-content');
  if (detailsContent) {
    detailsContent.innerHTML = content;
  }
  
  // Show modal using simple system (no Bootstrap dependency)
  modal.style.display = 'block';
  modal.classList.add('show');
  document.body.classList.add('modal-open');
  
  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop fade show';
  backdrop.id = `${modalId}-backdrop`;
  document.body.appendChild(backdrop);
  
  // סגירה בלחיצה על הרקע
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      hideModal(modalId);
    }
  });
  
  // כפתור העתקה
  const copyButton = modal.querySelector(`#${modalId}-copy-btn`);
  if (copyButton) {
    copyButton.addEventListener('click', () => {
      copyToClipboard(textContent, title);
    });
  }
  
  // כפתור סגירה בכותרת
  const headerCloseButton = modal.querySelector(`#${modalId}-close-btn`);
  if (headerCloseButton) {
    headerCloseButton.addEventListener('click', () => {
      hideModal(modalId);
    });
  }
  
  // כפתור סגירה ב-footer
  const footerCloseBtn = modal.querySelector(`#${modalId}-footer-close`);
  if (footerCloseBtn) {
    footerCloseBtn.addEventListener('click', () => {
      hideModal(modalId);
    });
  }
  
  console.log('✅ Details modal shown:', modalId);
}

// Helper function to hide modal
function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  const backdrop = document.getElementById(`${modalId}-backdrop`);
  
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
    modal.remove();
  }
  
  if (backdrop) {
    backdrop.remove();
  }
}

// Helper function to close all details modals
function closeAllDetailsModals() {
  // Find all existing details modals
  const existingModals = document.querySelectorAll('[id^="details-modal-"]');
  existingModals.forEach(modal => {
    const modalId = modal.id;
    hideModal(modalId);
  });
  
  // Remove any remaining backdrops
  const existingBackdrops = document.querySelectorAll('[id^="details-modal-"][id$="-backdrop"]');
  existingBackdrops.forEach(backdrop => {
    backdrop.remove();
  });
}

// Helper function to extract text content from HTML
function extractTextFromHTML(htmlContent) {
  // Create temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Extract text content
  let textContent = tempDiv.textContent || tempDiv.innerText || '';
  
  // Clean up the text
  textContent = textContent
    .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
    .replace(/\n\s+/g, '\n')  // Clean up line breaks
    .trim();
  
  return textContent;
}

// Helper function to copy text to clipboard
function copyToClipboard(textContent, title) {
  // Format the content with title
  const formattedContent = `${title}\n${'='.repeat(title.length)}\n\n${textContent}`;
  
  try {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(formattedContent).then(() => {
        showSuccessNotification('התוכן הועתק ללוח בהצלחה', 'העתקה');
        console.log('✅ Content copied to clipboard via Clipboard API');
      }).catch(err => {
        console.warn('Clipboard API failed, trying fallback:', err);
        fallbackCopyToClipboard(formattedContent);
      });
    } else {
      // Fallback for older browsers or non-secure contexts
      fallbackCopyToClipboard(formattedContent);
    }
  } catch (error) {
    console.error('❌ Error copying to clipboard:', error);
    fallbackCopyToClipboard(formattedContent);
  }
}

// Fallback copy function
function fallbackCopyToClipboard(text) {
  try {
    // Create temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 99999); // For mobile devices
    
    // Copy the text
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    
    if (successful) {
      showSuccessNotification('התוכן הועתק ללוח בהצלחה', 'העתקה');
      console.log('✅ Content copied to clipboard via fallback method');
    } else {
      throw new Error('execCommand failed');
    }
  } catch (error) {
    console.error('❌ Fallback copy failed:', error);
    showErrorNotification('שגיאה בהעתקה ללוח', 'שגיאה');
  }
}

// WARNING FUNCTIONS MOVED TO warning-system.js
// showValidationWarning, showConfirmationDialog, and showDeleteWarning
// are now located in scripts/warning-system.js



// ===== LEGACY SUPPORT =====
// These functions provide backward compatibility

/**
 * Legacy support function for old notification calls
 * NOTIFICATION SYSTEM - Handles old notification format for backward compatibility
 *
 * @param {string} message - Message (can be title + message)
 * @param {string} type - Notification type
 * @param {number} duration - Display duration
 */
function showNotificationLegacy(message, type = 'info', duration = 4000) {
  // Direct console log to avoid recursion
  console.log(`🔔 ${type.toUpperCase()}: ${message}`);
}

// ===== GLOBAL NOTIFICATION HISTORY SYSTEM =====
/**
 * Save notification to global history for notifications center
 * NOTIFICATION SYSTEM - Saves all notifications to UnifiedIndexedDB for global access
 *
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
async function saveNotificationToGlobalHistory(type, title, message, category = 'general') {
  try {
    // יצירת אובייקט התראה
    const notification = {
      id: Date.now() + Math.random(),
      type,
      title,
      message,
      category,
      time: new Date(),
      timestamp: Date.now(),
      page: window.location.pathname,
      url: window.location.href
    };

    // שמירה למערכת המטמון המאוחדת החדשה רק אם מאותחלת ולא נשמרה כבר
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized && !notification._savedToCache) {
      try {
        await window.UnifiedCacheManager.save('notification_history', notification, {
          layer: 'indexedDB',
          ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
          category: 'notification'
        });
        notification._savedToCache = true; // סימון שנשמרה
      } catch (error) {
        console.warn('שגיאה בשמירה במערכת המטמון החדשה, עובר ל-localStorage:', error.message);
      }
    } else if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
      // מערכת מטמון לא מאותחלת - מדלג על שמירה
      console.debug('⚠️ Cache system not initialized - skipping notification history save');
    }

    // Fallback ל-localStorage במקרה של בעיה
    try {
      let globalHistory = [];
      const savedHistory = localStorage.getItem('tiktrack_global_notifications_history');
      if (savedHistory) {
        globalHistory = JSON.parse(savedHistory);
      }

      globalHistory.unshift(notification);
      if (globalHistory.length > 100) {
        globalHistory = globalHistory.slice(0, 100);
      }

      localStorage.setItem('tiktrack_global_notifications_history', JSON.stringify(globalHistory));
    } catch (e) {
      console.warn('שגיאה בשמירת fallback ל-localStorage:', e);
    }

    // עדכון סטטיסטיקות גלובליות
    await updateGlobalNotificationStats();

    // console.log('✅ התראה נשמרה להיסטוריה גלובלית');
  } catch (error) {
    console.warn('שגיאה בשמירת התראה להיסטוריה גלובלית:', error);
  }
}

/**
 * Update global notification statistics
 * NOTIFICATION SYSTEM - Updates global stats for notifications center
 */
async function updateGlobalNotificationStats() {
  try {
    let history = [];
    
    // טעינת היסטוריה מ-UnifiedIndexedDB
    if (window.UnifiedIndexedDB && window.UnifiedIndexedDB.isInitialized) {
      try {
        history = await window.UnifiedIndexedDB.getNotificationHistory();
      } catch (error) {
        console.warn('שגיאה בטעינה מ-IndexedDB, עובר ל-localStorage:', error.message);
        history = [];
      }
    } else {
      // מערכת מטמון לא מאותחלת - מדלג על טעינה
      console.debug('⚠️ Cache system not initialized - skipping notification history load');
      history = [];
    }
    
    // Fallback ל-localStorage
    if (history.length === 0) {
      try {
        const savedHistory = localStorage.getItem('tiktrack_global_notifications_history');
        if (savedHistory) {
          history = JSON.parse(savedHistory);
        }
      } catch (e) {
        console.warn('שגיאה בטעינת היסטוריה מ-localStorage:', e);
      }
    }

    const stats = {
      success: history.filter(n => n.type === 'success').length,
      error: history.filter(n => n.type === 'error').length,
      warning: history.filter(n => n.type === 'warning').length,
      info: history.filter(n => n.type === 'info').length,
      total: history.length,
      lastUpdated: Date.now()
    };

    // שמירה למערכת המטמון המאוחדת - רק אם לא נשמרו כבר
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized && !stats._savedToCache) {
      try {
        await window.UnifiedCacheManager.save('notification_stats', stats, {
          layer: 'indexedDB',
          ttl: 24 * 60 * 60 * 1000, // 24 hours
          category: 'notification'
        });
        stats._savedToCache = true; // סימון שנשמרו
      } catch (error) {
        console.warn('שגיאה בשמירת סטטיסטיקות ב-IndexedDB:', error.message);
      }
    } else if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
      // מערכת מטמון לא מאותחלת - מדלג על שמירת סטטיסטיקות
      console.debug('⚠️ Cache system not initialized - skipping notification stats save');
    }

    // Fallback ל-localStorage
    try {
    localStorage.setItem('tiktrack_global_notifications_stats', JSON.stringify(stats));
    } catch (e) {
      console.warn('שגיאה בשמירת סטטיסטיקות ל-localStorage:', e);
    }
  } catch (error) {
    console.warn('שגיאה בעדכון סטטיסטיקות גלובליות:', error);
  }
}

/**
 * Load global notification history
 * NOTIFICATION SYSTEM - Loads global history for notifications center
 *
 * @returns {Promise<Array>} Global notification history
 */
async function loadGlobalNotificationHistory() {
  try {
    // טעינה מ-UnifiedIndexedDB
    if (window.UnifiedIndexedDB && window.UnifiedIndexedDB.isInitialized) {
      const history = await window.UnifiedIndexedDB.getAll('notificationHistory');
      if (history && history.length > 0) {
        return history;
      }
    } else {
      // IndexedDB לא זמין או לא מאותחל - מדלג על טעינה מ-IndexedDB
      // console.log('UnifiedIndexedDB לא מאותחל עדיין, מדלג על טעינת היסטוריה');
    }
    
    // Fallback ל-localStorage
    const savedHistory = localStorage.getItem('tiktrack_global_notifications_history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  } catch (error) {
    console.warn('שגיאה בטעינת היסטוריית התראות גלובלית:', error);
    return [];
  }
}

/**
 * Load global notification statistics
 * NOTIFICATION SYSTEM - Loads global stats for notifications center
 *
 * @returns {Promise<Object>} Global notification statistics
 */
async function loadGlobalNotificationStats() {
  try {
    // טעינה מ-UnifiedIndexedDB
    if (window.UnifiedIndexedDB && window.UnifiedIndexedDB.isInitialized) {
      const stats = await window.UnifiedIndexedDB.getNotificationStats();
      if (stats) {
        return stats;
      }
    } else {
      // IndexedDB לא זמין או לא מאותחל - מדלג על טעינה מ-IndexedDB
      console.log('UnifiedIndexedDB לא מאותחל עדיין, מדלג על טעינת סטטיסטיקות');
    }
    
    // Fallback ל-localStorage
    const savedStats = localStorage.getItem('tiktrack_global_notifications_stats');
    if (savedStats) {
      return JSON.parse(savedStats);
    }
  } catch (error) {
    console.warn('שגיאה בטעינת סטטיסטיקות גלובליות:', error);
  }

  // סטטיסטיקות ברירת מחדל
  return {
    success: 0,
    error: 0,
    warning: 0,
    info: 0,
    total: 0,
    lastUpdated: Date.now()
  };
}

/**
 * Format success information for copying
 * NOTIFICATION SYSTEM - Formats success details for clipboard
 *
 * @param {Object} successInfo - Success information object
 * @returns {string} Formatted success message
 */
function formatSuccessForCopy(successInfo) {
  return `
═══════════════════════════════════════════════════════════════
  🎉 פרטי הצלחה מפורטים - TikTrack System Success Details
═══════════════════════════════════════════════════════════════

📋 כותרת:
${successInfo.title}

📝 הודעה:
${successInfo.message}

🏷️ קטגוריה:
${successInfo.category}

🆔 מזהה:
${successInfo.id}

⏰ זמן:
${new Date(successInfo.timestamp).toLocaleString('he-IL')}

📊 פרטי הצלחה:
${JSON.stringify(successInfo.details, null, 2)}

🖥️ מידע דפדפן:
${JSON.stringify(successInfo.browser, null, 2)}

⚙️ מידע מערכת:
${JSON.stringify(successInfo.system, null, 2)}

${successInfo.performance ? `⚡ ביצועים:\n${JSON.stringify(successInfo.performance, null, 2)}\n` : ''}

═══════════════════════════════════════════════════════════════
  נוצר על ידי מערכת TikTrack - ${new Date().toLocaleString('he-IL')}
═══════════════════════════════════════════════════════════════
  `.trim();
}

// Global function for copying success details
window.copySuccessDetails = function() {
  if (window.currentSuccessInfo) {
    const successText = formatSuccessForCopy(window.currentSuccessInfo);
    navigator.clipboard.writeText(successText).then(() => {
      console.log('Success details copied to clipboard');
      // Show simple success notification to avoid recursion
      showSuccessNotification('פרטי ההצלחה הועתקו ללוח', 'הפרטים הועתקו בהצלחה');
    }).catch(err => {
      console.error('Failed to copy success details:', err);
      showSimpleErrorNotification('שגיאה בהעתקה', 'לא ניתן להעתיק את פרטי ההצלחה');
    });
  }
};

// ===== EXPORT TO GLOBAL SCOPE =====

// Export ALERTS SYSTEM functions to global scope
window.createAlert = createAlert;
window.updateAlert = updateAlert;
window.markAlertAsTriggered = markAlertAsTriggered;
window.markAlertAsRead = markAlertAsRead;


// Export NOTIFICATION SYSTEM functions to global scope
window.showNotification = showNotification;
window.showSuccessNotification = showSuccessNotification;
window.showFinalSuccessNotification = showFinalSuccessNotification;
window.showErrorNotification = showErrorNotification;
window.showSimpleErrorNotification = showSimpleErrorNotification;
window.showCriticalErrorNotification = showCriticalErrorNotification;
window.createCriticalError = createCriticalError;
window.withCriticalErrorHandling = withCriticalErrorHandling;
window.showWarningNotification = showWarningNotification;
window.showInfoNotification = showInfoNotification;
window.showDetailsModal = showDetailsModal;

// Export NOTIFICATION CATEGORIES SYSTEM functions to global scope
window.shouldShowNotification = shouldShowNotification;
window.shouldLogToConsole = shouldLogToConsole;
window.logWithCategory = logWithCategory;
window.getLogEmoji = getLogEmoji;

// Export GLOBAL NOTIFICATION HISTORY functions
window.saveNotificationToGlobalHistory = saveNotificationToGlobalHistory;
window.loadGlobalNotificationHistory = loadGlobalNotificationHistory;
window.loadGlobalNotificationStats = loadGlobalNotificationStats;
window.updateGlobalNotificationStats = updateGlobalNotificationStats;

// WARNING SYSTEM functions now exported from warning-system.js
// window.showValidationWarning, window.showConfirmationDialog, window.showDeleteWarning

// Export LINKED ITEMS SYSTEM functions to global scope
window.loadLinkedItemsData = loadLinkedItemsData;

// Export the module itself
window.notificationSystem = {
  // ALERTS SYSTEM functions
  createAlert,
  updateAlert,
  markAlertAsTriggered,
  markAlertAsRead,


  // NOTIFICATION SYSTEM functions
  showNotification,
  showSuccessNotification,
  showFinalSuccessNotification,
  showErrorNotification,
  showSimpleErrorNotification,
  showCriticalErrorNotification,
  createCriticalError,
  withCriticalErrorHandling,
  showWarningNotification,
  showInfoNotification,
  createNotificationContainer,
  hideNotification,
  getNotificationIcon,
  
  // NOTIFICATION CATEGORIES SYSTEM functions
  shouldShowNotification,
  shouldLogToConsole,
  logWithCategory,
  getLogEmoji,
  
  // WARNING SYSTEM functions moved to warning-system.js
  // showValidationWarning, showConfirmationDialog, showDeleteWarning

  // LINKED ITEMS SYSTEM functions
  loadLinkedItemsData,
};

// Global NotificationSystem object for compatibility
window.NotificationSystem = {
    show: window.showNotification,
    showSuccess: window.showSuccessNotification,
    showFinalSuccess: window.showFinalSuccessNotification,
    showError: window.showErrorNotification,
    showSimpleError: window.showSimpleErrorNotification,
    showCriticalError: window.showCriticalErrorNotification,
    createCriticalError: window.createCriticalError,
    withCriticalErrorHandling: window.withCriticalErrorHandling,
    showWarning: window.showWarningNotification,
    showInfo: window.showInfoNotification,
    showDetails: window.showDetailsModal,
    shouldShow: window.shouldShowNotification,
    logWithCategory: window.logWithCategory,
    getCategoryIcon: window.getCategoryIcon,
    addGlobal: window.addGlobalNotification,
    getGlobal: window.getGlobalNotifications,
    clearGlobal: window.clearGlobalNotifications,
    migrate: window.migrateNotifications,
    isMigrationNeeded: window.isMigrationNeeded,
    initialize: function() {
        console.log('🚀 NotificationSystem.initialize called');
        // Initialize notification system if needed
        // if (window.notificationSystemTester) {
        //     window.notificationSystemTester.runAllTests();
        // }
        return true;
    }
};

// פונקציה להצגת הודעה מפורטת בחלון
window.showDetailedNotification = async function(title, message, type = 'info', duration = 8000, category = null) {
  try {
    // יצירת modal עם התוכן המפורט
    const modalId = `detailed-notification-${Date.now()}`;
    const modalHtml = `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-${type === 'error' ? 'danger' : type === 'warning' ? 'warning' : type === 'success' ? 'success' : 'info'} text-white">
              <h5 class="modal-title" id="${modalId}Label">${title}</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div style="white-space: pre-line; font-family: monospace; font-size: 0.9em;">${message}</div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">סגור</button>
              <button type="button" class="btn btn-primary" onclick="copyToClipboard('${message.replace(/'/g, "\\'")}')">העתק</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // הוספת ה-modal ל-DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // הצגת ה-modal
    const modalElement = document.getElementById(modalId);
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    // הסרת ה-modal אחרי סגירה
    modalElement.addEventListener('hidden.bs.modal', () => {
      modalElement.remove();
    });
    
    // סגירה אוטומטית אחרי הזמן שצוין
    if (duration > 0) {
      setTimeout(() => {
        if (modalElement && document.contains(modalElement)) {
          modal.hide();
        }
      }, duration);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error showing detailed notification:', error);
    // fallback להודעה רגילה
    return await window.showNotification(message, type, title, duration, category);
  }
};

// Export new helper functions to global scope
window.closeAllDetailsModals = closeAllDetailsModals;
window.extractTextFromHTML = extractTextFromHTML;
window.copyToClipboard = copyToClipboard;

// בדיקת פונקציות בסוף טעינת notification-system.js
// notification-system.js נטען
// WARNING FUNCTIONS moved to warning-system.js
// showDeleteWarning, showConfirmationDialog, showValidationWarning now in warning-system.js

// ===== DYNAMIC LOADING GLOBAL FUNCTIONS =====

/**
 * Load module dynamically (Global function)
 * טעינת מודול דינמית (פונקציה גלובלית)
 * 
 * @param {string} moduleName - Name of module to load
 * @returns {Promise<boolean>} Success status
 */
window.loadModule = async function(moduleName) {
    if (window.UnifiedAppInitializer) {
        return await window.UnifiedAppInitializer.loadModule(moduleName);
    } else {
        console.error('❌ UnifiedAppInitializer not available');
        return false;
    }
};

/**
 * Get loading statistics (Global function)
 * קבלת סטטיסטיקות טעינה (פונקציה גלובלית)
 * 
 * @returns {Object} Loading statistics
 */
window.getLoadingStats = function() {
    if (window.UnifiedAppInitializer) {
        return window.UnifiedAppInitializer.getLoadingStats();
    } else {
        return {
            totalModules: 0,
            loadedModules: 0,
            loadingModules: 0,
            totalSize: '0KB',
            loadedSize: '0KB',
            loadingProgress: '0%'
        };
    }
};

/**
 * Check if module is loaded (Global function)
 * בדיקה אם מודול נטען (פונקציה גלובלית)
 * 
 * @param {string} moduleName - Name of module to check
 * @returns {boolean} Whether module is loaded
 */
window.isModuleLoaded = function(moduleName) {
    if (window.UnifiedAppInitializer) {
        return window.UnifiedAppInitializer.loadedModules.has(moduleName);
    } else {
        return false;
    }
};

/**
 * Get available modules (Global function)
 * קבלת מודולים זמינים (פונקציה גלובלית)
 * 
 * @returns {Array<string>} Available module names
 */
window.getAvailableModules = function() {
    if (window.UnifiedAppInitializer) {
        return Array.from(window.UnifiedAppInitializer.moduleConfigs.keys());
    } else {
        return [];
    }
};

/**
 * Enable/disable dynamic loading (Global function)
 * הפעלה/ביטול טעינה דינמית (פונקציה גלובלית)
 * 
 * @param {boolean} enabled - Whether to enable dynamic loading
 */
window.setDynamicLoading = function(enabled) {
    if (window.UnifiedAppInitializer) {
        window.UnifiedAppInitializer.dynamicLoadingEnabled = enabled;
        console.log(`🔧 Dynamic loading ${enabled ? 'enabled' : 'disabled'}`);
    } else {
        console.error('❌ UnifiedAppInitializer not available');
    }
};

console.log('✅ Core Systems module loaded successfully (Static Loading)');

// ===== PAGE INITIALIZATION CONFIGURATIONS =====
// Unified page configurations - previously in page-initialization-configs.js
// Moved here as part of loading system standardization (October 2025)

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
                
                // Call unified initialization function
                if (typeof window.initializeIndexPage === 'function') {
                    window.initializeIndexPage();
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
                
                if (typeof window.initializeTradePlansPage === 'function') {
                    window.initializeTradePlansPage();
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
                
                if (typeof window.initializeExecutionsPage === 'function') {
                    window.initializeExecutionsPage();
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
                
                if (typeof window.initializeAlertsPage === 'function') {
                    window.initializeAlertsPage();
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
                
                // אתחול modals
                if (typeof window.initializeCashFlowsModals === 'function') {
                    window.initializeCashFlowsModals();
                }
                
                // אתחול דף
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
                
                if (typeof window.initializeTickersPage === 'function') {
                    window.initializeTickersPage();
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
                
                if (typeof window.initializeNotesPage === 'function') {
                    window.initializeNotesPage();
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
                
                // אתחול modals ואלמנטים
                if (typeof window.initializeTradingAccountsModals === 'function') {
                    window.initializeTradingAccountsModals();
                }
                
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
