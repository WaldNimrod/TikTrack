/**
 * Unified Initialization System - TikTrack
 * ========================================
 *
 * מערכת אתחול מאוחדת שמחליפה את כל ה-DOMContentLoaded listeners
 * ומאפשרת גמישות מקסימלית עם תחזוקה קלה
 *
 * @version 1.0.0
 * @lastUpdated January 2025
 * @author TikTrack Development Team
 */

// ===== UNIFIED INITIALIZATION SYSTEM =====

class UnifiedInitialization {
    constructor() {
        this.initialized = false;
        this.pageConfig = null;
        this.customInitializers = [];
        this.errorHandlers = [];
    }

    /**
     * Initialize page with unified system
     * @param {string} pageName - Page name
     * @param {Object} customOptions - Custom initialization options
     */
    async initializePage(pageName, customOptions = {}) {
        if (this.initialized) {
            console.log('✅ Page already initialized');
            return;
        }

        console.log(`🚀 Initializing page: ${pageName}`);
        
        try {
            // Get page configuration
            this.pageConfig = window.getPageConfig(pageName);
            
            // Merge with custom options
            this.pageConfig = { ...this.pageConfig, ...customOptions };
            
            // Execute unified initialization
            await window.initializeApplication(this.pageConfig);
            
            this.initialized = true;
            console.log(`✅ Page ${pageName} initialized successfully`);
            
        } catch (error) {
            console.error(`❌ Page ${pageName} initialization failed:`, error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Handle initialization errors
     * @param {Error} error - Error object
     */
    handleInitializationError(error) {
        console.error('❌ Initialization Error:', error);
        
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
            window.showNotification('❌ Page initialization failed', 'error');
        }
    }

    /**
     * Add custom initialization function
     * @param {Function} initFunction - Custom initialization function
     */
    addCustomInitializer(initFunction) {
        this.customInitializers.push(initFunction);
    }

    /**
     * Add error handler
     * @param {Function} errorHandler - Error handler function
     */
    addErrorHandler(errorHandler) {
        this.errorHandlers.push(errorHandler);
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
     * Reset initialization status
     */
    reset() {
        this.initialized = false;
        this.pageConfig = null;
        this.customInitializers = [];
    }
}

// ===== GLOBAL INSTANCE =====

window.UnifiedInitialization = UnifiedInitialization;
window.unifiedInit = new UnifiedInitialization();

// ===== PAGE-SPECIFIC INITIALIZATION FUNCTIONS =====

/**
 * Initialize specific page type
 * @param {string} pageType - Page type
 * @param {Object} options - Initialization options
 */
window.initializePageType = async function(pageType, options = {}) {
    const pageName = window.unifiedInit.getCurrentPageName();
    
    // Add page-specific custom initializers
    switch (pageType) {
        case 'dashboard':
            window.unifiedInit.addCustomInitializer(async () => {
                console.log('📊 Dashboard-specific initialization...');
                // Dashboard-specific logic here
            });
            break;
            
        case 'trading':
            window.unifiedInit.addCustomInitializer(async () => {
                console.log('📈 Trading page initialization...');
                // Trading-specific logic here
            });
            break;
            
        case 'development':
            window.unifiedInit.addCustomInitializer(async () => {
                console.log('🔧 Development tools initialization...');
                // Development tools-specific logic here
            });
            break;
            
        case 'preferences':
            window.unifiedInit.addCustomInitializer(async () => {
                console.log('⚙️ Preferences initialization...');
                // Preferences-specific logic here
            });
            break;
    }
    
    // Initialize with unified system
    await window.unifiedInit.initializePage(pageName, options);
};

// ===== LEGACY SUPPORT FUNCTIONS =====

/**
 * Legacy support for old initialization patterns
 * @param {Function} initFunction - Legacy initialization function
 */
window.registerLegacyInitializer = function(initFunction) {
    window.unifiedInit.addCustomInitializer(initFunction);
};

/**
 * Legacy support for page-specific initialization
 * @param {string} pageName - Page name
 * @param {Function} initFunction - Page initialization function
 */
window.registerPageInitializer = function(pageName, initFunction) {
    const currentPage = window.unifiedInit.getCurrentPageName();
    if (currentPage === pageName) {
        window.unifiedInit.addCustomInitializer(initFunction);
    }
};

// ===== GLOBAL EXPORT =====

window.initializePage = async function(pageName, options = {}) {
    return await window.unifiedInit.initializePage(pageName, options);
};

// ===== AUTO-INITIALIZATION =====

// Main initialization - replaces all DOMContentLoaded listeners
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎯 DOM Content Loaded - Starting Unified Initialization');
    
    try {
        const pageName = window.unifiedInit.getCurrentPageName();
        console.log(`📄 Detected page: ${pageName}`);
        
        // Small delay to ensure all scripts are loaded
        setTimeout(async () => {
            await window.unifiedInit.initializePage(pageName);
        }, 100);
        
    } catch (error) {
        console.error('❌ Auto-initialization failed:', error);
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

