/**
 * Application Initializer - TikTrack Centralized Initialization System
 * ====================================================================
 *
 * מערכת אתחול מרכזית מאוחדת - גישה היררכית חכמה
 * 
 * ARCHITECTURE PRINCIPLES:
 * ========================
 * 1. Single Point of Entry - נקודת כניסה אחת
 * 2. Hierarchical Dependencies - תלויות היררכיות
 * 3. Error Resilience - עמידות בשגיאות
 * 4. Performance Optimized - מותאם לביצועים
 * 5. Flexible & Extensible - גמיש וניתן להרחבה
 *
 * INITIALIZATION STAGES:
 * ======================
 * Stage 1: Core Systems (Core)
 * Stage 2: UI Systems (UI)  
 * Stage 3: Page Systems (Page)
 * Stage 4: Validation (Validation)
 * Stage 5: Finalization (Final)
 *
 * @version 1.0.0
 * @lastUpdated January 2025
 * @author TikTrack Development Team
 */

// ===== GLOBAL APPLICATION INITIALIZER =====

class ApplicationInitializer {
    constructor() {
        this.stages = {
            core: {
                name: 'Core Systems',
                order: 1,
                dependencies: [],
                functions: []
            },
            ui: {
                name: 'UI Systems', 
                order: 2,
                dependencies: ['core'],
                functions: []
            },
            page: {
                name: 'Page Systems',
                order: 3, 
                dependencies: ['core', 'ui'],
                functions: []
            },
            validation: {
                name: 'Validation Systems',
                order: 4,
                dependencies: ['core', 'ui', 'page'],
                functions: []
            },
            final: {
                name: 'Finalization',
                order: 5,
                dependencies: ['core', 'ui', 'page', 'validation'],
                functions: []
            }
        };
        
        this.initializationStatus = {
            isInitializing: false,
            isInitialized: false,
            currentStage: null,
            completedStages: [],
            errors: [],
            startTime: null,
            endTime: null
        };
        
        this.pageConfig = {};
        this.errorHandlers = [];
    }

    /**
     * Register initialization function for specific stage
     * @param {string} stage - Stage name (core, ui, page, validation, final)
     * @param {Function} initFunction - Function to execute
     * @param {Object} options - Configuration options
     */
    registerStageFunction(stage, initFunction, options = {}) {
        if (!this.stages[stage]) {
            throw new Error(`Invalid stage: ${stage}`);
        }
        
        this.stages[stage].functions.push({
            name: options.name || initFunction.name || 'anonymous',
            function: initFunction,
            required: options.required !== false,
            timeout: options.timeout || 5000,
            retries: options.retries || 0
        });
    }

    /**
     * Configure page-specific initialization
     * @param {Object} config - Page configuration
     */
    configurePage(config) {
        this.pageConfig = {
            name: config.name || this.getCurrentPageName(),
            requiresFilters: config.requiresFilters || false,
            requiresValidation: config.requiresValidation || false,
            requiresTables: config.requiresTables || false,
            customInitializers: config.customInitializers || [],
            ...config
        };
    }

    /**
     * Main initialization function - Single Point of Entry
     * @param {Object} options - Initialization options
     */
    async initializeApplication(options = {}) {
        if (this.initializationStatus.isInitializing) {
            console.warn('⚠️ Application already initializing, skipping...');
            return;
        }

        if (this.initializationStatus.isInitialized) {
            console.log('✅ Application already initialized');
            return this.initializationStatus;
        }

        console.log('🚀 Starting Application Initialization...');
        this.initializationStatus.isInitializing = true;
        this.initializationStatus.startTime = Date.now();
        this.initializationStatus.errors = [];

        try {
            // Configure page if options provided
            if (Object.keys(options).length > 0) {
                this.configurePage(options);
            }

            // Execute stages in order
            const stageOrder = Object.values(this.stages)
                .sort((a, b) => a.order - b.order)
                .map(stage => stage.name);

            for (const stageName of stageOrder) {
                const stageKey = Object.keys(this.stages).find(key => 
                    this.stages[key].name === stageName
                );
                
                await this.executeStage(stageKey);
            }

            this.initializationStatus.isInitialized = true;
            this.initializationStatus.endTime = Date.now();
            
            const duration = this.initializationStatus.endTime - this.initializationStatus.startTime;
            console.log(`✅ Application Initialization Complete! (${duration}ms)`);
            
            return this.initializationStatus;

        } catch (error) {
            console.error('❌ Application Initialization Failed:', error);
            this.initializationStatus.errors.push({
                stage: this.initializationStatus.currentStage,
                error: error.message,
                timestamp: Date.now()
            });
            throw error;
        } finally {
            this.initializationStatus.isInitializing = false;
        }
    }

    /**
     * Execute specific initialization stage
     * @param {string} stageKey - Stage key
     */
    async executeStage(stageKey) {
        const stage = this.stages[stageKey];
        if (!stage) {
            throw new Error(`Stage not found: ${stageKey}`);
        }

        console.log(`🔄 Executing Stage ${stage.order}: ${stage.name}`);
        this.initializationStatus.currentStage = stage.name;

        // Check dependencies
        for (const dep of stage.dependencies) {
            if (!this.initializationStatus.completedStages.includes(dep)) {
                throw new Error(`Dependency not met: ${dep} required for ${stage.name}`);
            }
        }

        // Execute stage functions
        for (const funcConfig of stage.functions) {
            await this.executeFunction(funcConfig, stage.name);
        }

        this.initializationStatus.completedStages.push(stageKey);
        console.log(`✅ Stage ${stage.order}: ${stage.name} - Complete`);
    }

    /**
     * Execute individual initialization function
     * @param {Object} funcConfig - Function configuration
     * @param {string} stageName - Stage name for logging
     */
    async executeFunction(funcConfig, stageName) {
        const { name, function: initFunction, required, timeout, retries } = funcConfig;
        
        console.log(`  🔧 Executing: ${name}`);
        
        try {
            // Execute with timeout
            const result = await Promise.race([
                initFunction(this.pageConfig),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout)
                )
            ]);
            
            console.log(`  ✅ ${name} - Success`);
            return result;
            
        } catch (error) {
            console.error(`  ❌ ${name} - Failed:`, error.message);
            
            if (required) {
                throw new Error(`Required function ${name} failed: ${error.message}`);
            } else {
                console.warn(`  ⚠️ Non-required function ${name} failed, continuing...`);
            }
        }
    }

    /**
     * Get current page name
     * @returns {string} Current page name
     */
    getCurrentPageName() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index';
        return filename.replace('.html', '');
    }

    /**
     * Get initialization status
     * @returns {Object} Current status
     */
    getStatus() {
        return { ...this.initializationStatus };
    }

    /**
     * Reset initialization status (for testing)
     */
    reset() {
        this.initializationStatus = {
            isInitializing: false,
            isInitialized: false,
            currentStage: null,
            completedStages: [],
            errors: [],
            startTime: null,
            endTime: null
        };
    }
}

// ===== GLOBAL INSTANCE =====

window.ApplicationInitializer = ApplicationInitializer;
window.appInitializer = new ApplicationInitializer();

// ===== STAGE REGISTRATIONS =====

// Stage 1: Core Systems
window.appInitializer.registerStageFunction('core', async (pageConfig) => {
    console.log('🔧 Initializing Core Systems...');
    
    // Initialize notification system
    if (typeof window.NotificationSystem !== 'undefined') {
        await window.NotificationSystem.initialize();
    }
    
    // Initialize preferences system
    if (typeof window.preferencesCache !== 'undefined') {
        window.preferencesCache.clear();
    }
    
    // Initialize favicon system
    if (typeof window.restoreFaviconFromStatus === 'function') {
        window.restoreFaviconFromStatus();
    }
    
    // Initialize color scheme system
    if (typeof window.loadColorScheme === 'function') {
        window.loadColorScheme();
    }
    
    // Initialize central refresh system
    if (typeof window.centralRefresh !== 'undefined') {
        console.log('✅ Central refresh system initialized');
    }
    
    console.log('✅ Core Systems initialized');
}, { name: 'CoreSystemsInit', required: true });

// Stage 2: UI Systems
window.appInitializer.registerStageFunction('ui', async (pageConfig) => {
    console.log('🔧 Initializing UI Systems...');
    
    // Initialize header system
    if (typeof window.HeaderSystem !== 'undefined') {
        await window.HeaderSystem.initialize();
    }
    
    // Initialize filter system
    if (typeof window.FilterSystem !== 'undefined') {
        await window.FilterSystem.initialize();
    }
    
    console.log('✅ UI Systems initialized');
}, { name: 'UISystemsInit', required: true });

// Stage 3: Page Systems
window.appInitializer.registerStageFunction('page', async (pageConfig) => {
    console.log('🔧 Initializing Page Systems...');
    
    // Initialize page-specific systems
    if (pageConfig.requiresFilters && typeof window.initializePageFilters === 'function') {
        await window.initializePageFilters(pageConfig.name);
    }
    
    // Initialize tables if required
    if (pageConfig.requiresTables && typeof window.setupSortableHeaders === 'function') {
        window.setupSortableHeaders();
    }
    
        // Execute custom initializers
        if (pageConfig.customInitializers && Array.isArray(pageConfig.customInitializers)) {
            for (const customInit of pageConfig.customInitializers) {
                if (typeof customInit === 'function') {
                    await customInit(pageConfig);
                }
            }
        }
    
    console.log('✅ Page Systems initialized');
}, { name: 'PageSystemsInit', required: false });

// Stage 4: Validation Systems
window.appInitializer.registerStageFunction('validation', async (pageConfig) => {
    console.log('🔧 Initializing Validation Systems...');
    
    if (pageConfig.requiresValidation && typeof window.initializeValidation === 'function') {
        // Find forms on page and initialize validation
        const forms = document.querySelectorAll('form[id]');
        for (const form of forms) {
            await window.initializeValidation(form.id);
        }
    }
    
    console.log('✅ Validation Systems initialized');
}, { name: 'ValidationSystemsInit', required: false });

// Stage 5: Finalization
window.appInitializer.registerStageFunction('final', async (pageConfig) => {
    console.log('🔧 Finalizing Application...');
    
    // Restore section states
    if (typeof window.restoreAllSectionStates === 'function') {
        const restoredCount = window.restoreAllSectionStates();
        console.log(`✅ Restored ${restoredCount} section states`);
    }
    
    // Restore page state
    if (typeof window.loadPageState === 'function') {
        await window.loadPageState();
    }
    
    // Show initialization complete notification
    if (typeof window.showNotification === 'function') {
        window.showNotification('✅ Application initialized successfully', 'success');
    }
    
    console.log('✅ Application finalized');
}, { name: 'FinalizationInit', required: false });

// ===== GLOBAL EXPORT =====

window.initializeApplication = async function(options = {}) {
    return await window.appInitializer.initializeApplication(options);
};

window.getInitializationStatus = function() {
    return window.appInitializer.getStatus();
};

// ===== AUTO-INITIALIZATION (Optional) =====

// Only auto-initialize if no other DOMContentLoaded listeners exist
document.addEventListener('DOMContentLoaded', async () => {
    // Small delay to ensure other systems are loaded
    setTimeout(async () => {
        try {
            await window.initializeApplication();
        } catch (error) {
            console.error('❌ Auto-initialization failed:', error);
        }
    }, 100);
});
