// Index page specific JavaScript
console.log('🏠 index.js loaded successfully!');

// Chart.js library needed for charts
if (typeof Chart === 'undefined') {
    console.warn('⚠️ Chart.js library not loaded - charts will not display');
}

// Function to switch between table tabs
function switchTableTab(tabName) {
    console.log('🔄 Switching to tab:', tabName);
    
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

// Function to update chart period
function updateChartPeriod(period) {
    console.log('📊 Updating chart period to:', period);
    // Chart update logic would go here
}

// Function to refresh charts
function refreshCharts() {
    console.log('🔄 Refreshing charts...');
    // Chart refresh logic would go here
}

// Function to refresh overview
function refreshOverview() {
    console.log('🔄 Refreshing overview...');
    // Overview refresh logic would go here
}

// Function to export overview
function exportOverview() {
    console.log('📤 Exporting overview...');
    // Export logic would go here
}

// Function for quick actions
function quickAction(action) {
    console.log('⚡ Quick action:', action);
    
    switch (action) {
        case 'new-trade':
            window.location.href = 'trades.html';
            break;
        case 'new-alert':
            window.location.href = 'alerts.html';
            break;
        case 'new-account':
            window.location.href = 'accounts.html';
            break;
        case 'export-data':
            console.log('📊 Export data - feature to be added');
            break;
        case 'reports':
            console.log('📋 Reports - feature to be added');
            break;
        case 'preferences-v2':
            console.log('🚀 Opening Preferences V2 advanced system');
            window.location.href = 'preferences-v2.html';
            break;
        case 'settings':
            console.log('🔄 Opening Preferences V1 traditional system');
            window.location.href = 'preferences-v2.html';
            break;
        case 'documentation':
            window.open('../JAVASCRIPT_SCRIPTS_ARCHITECTURE.md', '_blank');
            break;
        default:
            console.log('❓ Unknown action:', action);
    }
}

// Load action buttons for tables
function loadActionButtons() {
    console.log('🔧 Loading action buttons for homepage tables...');
    
    if (typeof window.loadTableActionButtons === 'function') {
        // Load buttons for trades table
        window.loadTableActionButtons('tradesContainer', 'trade', {
            showDetails: true,
            showLinked: true,
            showEdit: true,
            showCancel: true,
            showDelete: true
        });
        
        // Load buttons for alerts table
        window.loadTableActionButtons('alertsContainer', 'alert', {
            showDetails: false,
            showLinked: false,
            showEdit: true,
            showCancel: false,
            showDelete: true
        });
        
        // Load buttons for accounts table
        window.loadTableActionButtons('accountsContainer', 'account', {
            showDetails: true,
            showLinked: false,
            showEdit: true,
            showCancel: false,
            showDelete: false
        });
        
        console.log('✅ Action buttons loaded for all tables');
    } else {
        console.log('❌ loadTableActionButtons function not available');
    }
}

// Initialize page after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 Homepage DOM loaded - initializing...');
    
    // Load action buttons after a short delay to ensure UI utils are loaded
    setTimeout(loadActionButtons, 500);
    
    console.log('✅ Homepage initialized successfully');
});

// Export functions to global scope
window.switchTableTab = switchTableTab;
window.updateChartPeriod = updateChartPeriod;
window.refreshCharts = refreshCharts;
window.refreshOverview = refreshOverview;
window.exportOverview = exportOverview;
window.quickAction = quickAction;
