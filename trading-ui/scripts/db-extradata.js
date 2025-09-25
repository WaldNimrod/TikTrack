// DB Extra Data Page Script
document.addEventListener('DOMContentLoaded', function () {
    console.log('טבלאות עזר - עמוד נטען');
    // Filter system is handled by the unified initialization system
    // No need to initialize manually
});

// ===== MISSING FUNCTIONS FOR ONCLICK ATTRIBUTES =====

// Toggle functions


// Sorting functions

// Trigger functions
function showTriggerDetails(triggerId) {
    if (typeof window.showTriggerDetails === 'function') {
        window.showTriggerDetails(triggerId);
    } else {
        console.warn('showTriggerDetails function not found');
        console.log('Trigger details for:', triggerId);
    }
}

function testTrigger(triggerId) {
    if (typeof window.testTrigger === 'function') {
        window.testTrigger(triggerId);
    } else {
        console.warn('testTrigger function not found');
        console.log('Testing trigger:', triggerId);
    }
}

// ===== GLOBAL EXPORTS =====
// Export functions to global scope for onclick attributes
// window.toggleSection removed - using global version from ui-utils.js
// window.toggleSection export removed - using global version from ui-utils.js
// window.sortTable export removed - using global version from tables.js
window.showTriggerDetails = showTriggerDetails;
window.testTrigger = testTrigger;
