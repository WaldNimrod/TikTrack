/**
 * Notes Page Initializer
 * ======================
 * 
 * Initializes the unified header system for notes page
 */

console.log('🔄 Notes initializer loaded');

// אתחול מערכת הכותרת החדשה
document.addEventListener("DOMContentLoaded", () => {
    console.log("🔄 Initializing unified header system...");
    if (window.headerSystem) {
        window.headerSystem.init();
    }
    if (window.filterSystem) {
        window.filterSystem.initialize();
    }
});

