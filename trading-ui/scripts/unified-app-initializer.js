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
            console.log('✅ Application already initialized');
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
        
        const config = {
            name: this.pageInfo.name,
            type: this.pageInfo.type,
            requiresFilters: this.pageInfo.requirements.filters,
            requiresValidation: this.pageInfo.requirements.validation,
            requiresTables: this.pageInfo.requirements.tables,
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
        
        // Use the application initializer if available
        if (typeof window.initializeApplication === 'function') {
            await window.initializeApplication(config);
        } else {
            // Fallback to manual initialization
            await this.manualInitialization(config);
        }
        
        this.performanceMetrics.stageTimes.execute = Date.now() - stageStart;
        console.log('✅ Stage 3 Complete');
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
        
        // Execute custom finalizers
        for (const initializer of this.customInitializers) {
            if (typeof initializer === 'function') {
                await initializer();
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
        
        return {
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
     * Manual initialization fallback
     */
    async manualInitialization(config) {
        console.log('🔧 Manual initialization fallback...');
        
        // Initialize core systems
        if (this.availableSystems.has('notification') && typeof window.NotificationSystem !== 'undefined') {
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
        console.log('🎉 Unified App Initialization Success!', {
            page: this.pageInfo.name,
            type: this.pageInfo.type,
            systems: this.availableSystems.size,
            totalTime: `${this.performanceMetrics.totalTime}ms`,
            stages: this.performanceMetrics.stageTimes
        });
        
        // Show success notification
        if (typeof window.showNotification === 'function') {
            window.showNotification('✅ Application initialized successfully', 'success');
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

// ===== AUTO-INITIALIZATION =====

// Single DOMContentLoaded listener - replaces all others
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎯 DOM Content Loaded - Starting Unified App Initialization');
    
    try {
        // Small delay to ensure all scripts are loaded
        setTimeout(async () => {
            await window.initializeUnifiedApp();
        }, 100);
        
    } catch (error) {
        console.error('❌ Unified App auto-initialization failed:', error);
    }
});

// ===== ERROR HANDLING =====

window.addEventListener('error', (event) => {
    console.error('❌ Global Error:', event.error);
    
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

