/**
 * Tickers Page Initializer
 * ========================
 * 
 * Initializes the unified header system for tickers page
 */

console.log('🔄 Tickers initializer loaded');

document.addEventListener("DOMContentLoaded", () => {
    console.log("🔄 Initializing unified header system...");
    if (window.headerSystem) {
        window.headerSystem.init();
    }
    if (window.filterSystem) {
        window.filterSystem.initialize();
    }
});
