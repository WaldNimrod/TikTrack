/**
 * Background Tasks Initialization Script
 * =====================================
 * Handles DOM initialization and page-specific setup
 * Extracted from inline script in background-tasks.html
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initializing Background Tasks page...');
    
    // Initialize unified header system
    if (typeof HeaderSystem !== 'undefined' && window.headerSystem) {
        console.log("✅ HeaderSystem found, initializing...");
        window.headerSystem.init();
    } else {
        console.log("❌ HeaderSystem not found, creating new instance...");
        if (typeof HeaderSystem !== 'undefined') {
            window.headerSystem = new HeaderSystem();
            window.headerSystem.init();
        }
    }
    
    // Initialize filter system
    if (window.filterSystem) {
        window.filterSystem.initialize();
    }
    
    console.log('✅ Background Tasks page initialized successfully');
});

// Export initialization function
window.initializeBackgroundTasksPage = function() {
    console.log('🔧 Manual initialization of Background Tasks page...');
    // Additional initialization logic can be added here
};

