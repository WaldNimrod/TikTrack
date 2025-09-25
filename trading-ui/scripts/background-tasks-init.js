/**
 * Background Tasks Initialization Script
 * =====================================
 * Handles DOM initialization and page-specific setup
 * Extracted from inline script in background-tasks.html
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initializing Background Tasks page...');
    
    // מערכת הכותרת מאותחלת אוטומטית על ידי header-system.js
    console.log("✅ Header system initialized by header-system.js");
    
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

