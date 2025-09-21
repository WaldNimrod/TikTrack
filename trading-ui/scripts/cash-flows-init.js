/**
 * Cash Flows Page Initializer
 * ===========================
 * 
 * Initializes the cash flows page with header system and modal fixes
 */

console.log('🔄 Cash Flows initializer loaded');

document.addEventListener('DOMContentLoaded', function () {
    // Initialize cash flows page
    initializeCashFlowsPage();
    
    // אתחול מערכת הכותרת החדשה
    console.log("🔄 Initializing unified header system...");
    if (window.headerSystem) {
        window.headerSystem.init();
    }
    if (window.filterSystem) {
        window.filterSystem.initialize();
    }
    
    // תיקון בעיית aria-hidden במודלים
    // תיקון למודל עריכה
    const editModal = document.getElementById('editCashFlowModal');
    if (editModal) {
        editModal.addEventListener('hidden.bs.modal', function() {
            this.removeAttribute('aria-hidden');
        });
    }
});

