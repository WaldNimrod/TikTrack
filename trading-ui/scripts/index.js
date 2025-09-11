// Index page specific JavaScript
console.log('🏠 index.js loaded successfully!');

// Chart.js library needed for charts
if (typeof Chart === 'undefined') {
    console.warn('⚠️ Chart.js library not loaded - charts will not display');
}

// Chart instances
let performanceChart = null;
let allocationChart = null;
let accountsChart = null;
let riskChart = null;

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
    initializeCharts();
}

// Function to initialize all charts
function initializeCharts() {
    console.log('📊 Initializing charts...');
    
    // Initialize Performance Chart - Simple line chart
    const performanceCtx = document.getElementById('performanceChart');
    if (performanceCtx && typeof Chart !== 'undefined') {
        if (performanceChart) performanceChart.destroy();
        
        performanceChart = new Chart(performanceCtx, {
            type: 'line',
            data: {
                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                datasets: [{
                    label: 'תיק',
                    data: [100, 115, 125, 140],
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });
    }
    
    // Initialize Allocation Chart - Simple doughnut
    const allocationCtx = document.getElementById('allocationChart');
    if (allocationCtx && typeof Chart !== 'undefined') {
        if (allocationChart) allocationChart.destroy();
        
        allocationChart = new Chart(allocationCtx, {
            type: 'doughnut',
            data: {
                labels: ['טכנולוגיה', 'פיננסים', 'אחר'],
                datasets: [{
                    data: [50, 30, 20],
                    backgroundColor: ['#28a745', '#007bff', '#ffc107']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
    
    // Initialize Accounts Chart - Simple bar
    const accountsCtx = document.getElementById('accountsChart');
    if (accountsCtx && typeof Chart !== 'undefined') {
        if (accountsChart) accountsChart.destroy();
        
        accountsChart = new Chart(accountsCtx, {
            type: 'bar',
            data: {
                labels: ['USD', 'ILS', 'EUR'],
                datasets: [{
                    data: [15, 8, 12],
                    backgroundColor: ['#28a745', '#007bff', '#ffc107']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });
    }
    
    // Initialize Risk Chart - Simple scatter
    const riskCtx = document.getElementById('riskChart');
    if (riskCtx && typeof Chart !== 'undefined') {
        if (riskChart) riskChart.destroy();
        
        riskChart = new Chart(riskCtx, {
            type: 'scatter',
            data: {
                datasets: [{
                    data: [
                        {x: 5, y: 8}, {x: 7, y: 12}, {x: 3, y: 6}, {x: 9, y: 15}
                    ],
                    backgroundColor: '#28a745',
                    pointRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });
    }
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

// Function to export specific chart
function exportChart(chartType) {
    console.log('📤 Exporting chart:', chartType);
    
    let chart = null;
    let filename = '';
    
    switch(chartType) {
        case 'performance':
            chart = performanceChart;
            filename = 'performance-chart.png';
            break;
        case 'allocation':
            chart = allocationChart;
            filename = 'allocation-chart.png';
            break;
        case 'accounts':
            chart = accountsChart;
            filename = 'accounts-chart.png';
            break;
        case 'risk':
            chart = riskChart;
            filename = 'risk-chart.png';
            break;
        default:
            console.warn('Unknown chart type:', chartType);
            return;
    }
    
    if (chart) {
        // Create download link
        const link = document.createElement('a');
        link.download = filename;
        link.href = chart.toBase64Image();
        link.click();
        
        console.log('✅ Chart exported:', filename);
    } else {
        console.warn('Chart not found:', chartType);
    }
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
            console.log('🚀 Opening Preferences advanced system');
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
    
    // Initialize charts after a delay to ensure Chart.js is loaded
    setTimeout(initializeCharts, 1000);
    
    console.log('✅ Homepage initialized successfully');
});

// Export functions to global scope
window.switchTableTab = switchTableTab;
window.updateChartPeriod = updateChartPeriod;
window.refreshCharts = refreshCharts;
window.initializeCharts = initializeCharts;
window.refreshOverview = refreshOverview;
window.exportOverview = exportOverview;
window.exportChart = exportChart;
window.quickAction = quickAction;
