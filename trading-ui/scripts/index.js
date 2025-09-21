/**
 * Index Page JavaScript - TikTrack
 * עמוד הבית - JavaScript
 * 
 * @version 1.0.0
 * @lastUpdated December 2024
 * @author TikTrack Development Team
 */

console.log('🏠 Index page JavaScript loaded');

// Index page specific variables

// Function to switch between table tabs
function switchTableTab(tabName) {
    // Hide all table contents
    document.querySelectorAll('.table-content').forEach(table => {
        table.classList.add('d-none');
    });

    // Remove active class from all tabs
    document.querySelectorAll('.table-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected table
    const selectedTable = document.getElementById(tabName + 'Container');
    if (selectedTable) {
        selectedTable.classList.remove('d-none');
    }

    // Add active class to selected tab
    event.target.classList.add('active');
}

// Function to refresh overview data (placeholder)
function refreshOverview() {
    console.log('Refreshing overview data...');
    // Implement data fetching and UI update for overview section
}

// Function to export overview data (placeholder)
function exportOverview() {
    if (typeof showNotification === 'function') {
        showNotification('info', 'ייצוא נתוני סקירה יהיה זמין בעתיד');
    } else {
        console.log('📤 Export overview data - Future feature');
    }
}

// Function for quick actions (placeholder)
function quickAction(actionType) {
    if (typeof showNotification === 'function') {
        showNotification('info', `פעולה מהירה '${actionType}' תהיה זמינה בעתיד`);
    } else {
        console.log(`⚡ Quick action: ${actionType} - Future feature`);
    }
}

// Function to toggle all sections (placeholder)
function toggleAllSections() {
    console.log('Toggling all sections - Future feature');
    // Implement logic to toggle all collapsible sections
}

// Function to toggle specific section
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const toggleIcon = section.querySelector('.section-toggle-icon');
    const content = section.querySelector('.section-body');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        toggleIcon.textContent = '▼';
    } else {
        content.style.display = 'none';
        toggleIcon.textContent = '▶';
    }
}

// Event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 Index page initialized');
    
    // Initialize overview data
    refreshOverview();
    
    // Setup action buttons
    const refreshButton = document.querySelector('.btn-primary');
    if (refreshButton) {
        refreshButton.addEventListener('click', refreshOverview);
    }
    
    const exportButton = document.querySelector('.btn-secondary');
    if (exportButton) {
        exportButton.addEventListener('click', exportOverview);
    }
});

// Export functions to global scope
window.switchTableTab = switchTableTab;
window.refreshOverview = refreshOverview;
window.exportOverview = exportOverview;
window.quickAction = quickAction;
window.toggleAllSections = toggleAllSections;
window.toggleSection = toggleSection;

console.log('✅ Index page ready');