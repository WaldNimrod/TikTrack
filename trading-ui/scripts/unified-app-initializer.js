/**
 * Unified App Initializer - TikTrack Final System
 * ==============================================
 *
 * המערכת הסופית המאוחדת שמחליפה את כל ה-DOMContentLoaded listeners
 * ומאפשרת גמישות מקסימלית עם תחזוקה קלה
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
            console.log('🔍 Looking for config:', this.pageInfo.name);
        }
        
        if (typeof window.pageInitializationConfigs !== 'undefined' && 
            window.pageInitializationConfigs[this.pageInfo.name]) {
            pageConfig = window.pageInitializationConfigs[this.pageInfo.name];
            console.log(`📋 Loaded page config for ${this.pageInfo.name}:`, pageConfig);
        } else if (typeof window.PAGE_CONFIGS !== 'undefined' && 
                   window.PAGE_CONFIGS[this.pageInfo.name]) {
            pageConfig = window.PAGE_CONFIGS[this.pageInfo.name];
            console.log(`📋 Loaded page config from PAGE_CONFIGS for ${this.pageInfo.name}:`, pageConfig);
        } else {
            console.log(`⚠️ No page config found for ${this.pageInfo.name}`);
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
            name: this.pageInfo.name,
            type: this.pageInfo.type,
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
            
            // ← NEW: ולידציה
            const validation = this.validateRequiredSystems(config);
            if (!validation.valid) {
                throw new Error('System validation failed');
            }
            
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
        if (['system-management', 'crud-testing-dashboard', 'linter-realtime-monitor', 'cache-test', 'conditions-test'].includes(pageName)) return 'development';
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
        console.group('🔴 שגיאה קריטית באתחול');
        
        if (validationResult.errors.length > 0) {
            console.error('שגיאות:', validationResult.errors);
        }
        
        if (validationResult.missing.length > 0) {
            console.error('סקריפטים חסרים:');
            validationResult.missing.forEach(m => {
                console.error(`  ❌ ${m.script}`);
                console.error(`     חבילה: ${m.package}`);
                console.error(`     Global: ${m.global}`);
                console.error(`     תיאור: ${m.description}`);
                console.error(`     פתרון: הוסף <script src="scripts/${m.script}"></script>`);
            });
        }
        
        console.groupEnd();
        
        // הצג גם על המסך
        if (typeof window.showNotification === 'function') {
            const msg = `שגיאה קריטית: ${validationResult.missing.length} סקריפטים חסרים. בדוק console`;
            window.showNotification(msg, 'error');
        }
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
            pageName: this.pageInfo.name,
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
            const key = `init_metrics_${this.pageInfo.name}`;
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
            const key = `init_metrics_${this.pageInfo.name}`;
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
        // Small delay to ensure all scripts are loaded
        setTimeout(async () => {
            console.log('🚀 About to call initializeUnifiedApp...');
            await window.initializeUnifiedApp();
            console.log('✅ initializeUnifiedApp completed');
        }, 100);
        
    } catch (error) {
        console.error('❌ Unified App auto-initialization failed:', error);
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

