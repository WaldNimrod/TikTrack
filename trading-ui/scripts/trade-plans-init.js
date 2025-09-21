/**
 * Trade Plans Page Initializer
 * ============================
 * 
 * Initializes the unified header system for trade plans page
 */

console.log('🔄 Trade Plans initializer loaded');

document.addEventListener("DOMContentLoaded", () => {
    console.log("🔄 Initializing unified header system...");
    if (window.headerSystem) {
        window.headerSystem.init();
    }
    if (window.filterSystem) {
        window.filterSystem.initialize();
    }
});

