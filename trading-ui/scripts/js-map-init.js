/**
 * JS-Map System Initializer
 * =========================
 * 
 * Initializes the JS-Map system when DOM is ready
 */

console.log('🚀 JS-Map initializer loaded');

// Initialize JS-Map system when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing JS-Map system...');
    
    // Create and initialize JS-Map system
    window.jsMapSystem = new JsMapSystem();
    window.jsMapSystem.init().then(() => {
        console.log('✅ JS-Map system initialized successfully');
    }).catch(error => {
        console.error('❌ Failed to initialize JS-Map system:', error);
    });
});

