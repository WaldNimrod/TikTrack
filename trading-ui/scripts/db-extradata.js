// DB Extra Data Page Script
document.addEventListener('DOMContentLoaded', function () {
    console.log('טבלאות עזר - עמוד נטען');
    if (window.filterSystem) {
        window.filterSystem.initialize();
    }
});

// ===== MISSING FUNCTIONS FOR ONCLICK ATTRIBUTES =====

// Toggle functions
function toggleTopSection() {
    if (typeof window.toggleTopSection === 'function') {
        window.toggleTopSection();
    } else {
        console.warn('toggleTopSection function not found');
    }
}

function toggleSection(sectionId) {
    if (typeof window.toggleSection === 'function') {
        window.toggleSection(sectionId);
    } else {
        console.warn('toggleSection function not found');
    }
}

// Sorting functions
function sortTable(columnIndex, tableId) {
    if (typeof window.sortTable === 'function') {
        window.sortTable(columnIndex, tableId);
    } else {
        console.warn('sortTable function not found');
    }
}

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
window.toggleTopSection = toggleTopSection;
window.toggleSection = toggleSection;
window.sortTable = sortTable;
window.showTriggerDetails = showTriggerDetails;
window.testTrigger = testTrigger;
