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
    
    // Initialize Performance Chart
    const performanceCtx = document.getElementById('performanceChart');
    if (performanceCtx && typeof Chart !== 'undefined') {
        if (performanceChart) performanceChart.destroy();
        
        performanceChart = new Chart(performanceCtx, {
            type: 'line',
            data: {
                labels: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'],
                datasets: [{
                    label: 'תיק השקעות',
                    data: [100, 105, 102, 108, 115, 112, 118, 125, 122, 128, 135, 140],
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4
                }, {
                    label: 'מדד תל אביב 35',
                    data: [100, 103, 101, 106, 110, 108, 112, 116, 114, 118, 122, 125],
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'ביצועי תיק מול מדד תל אביב 35'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'תשואה (%)'
                        }
                    }
                }
            }
        });
    }
    
    // Initialize Allocation Chart
    const allocationCtx = document.getElementById('allocationChart');
    if (allocationCtx && typeof Chart !== 'undefined') {
        if (allocationChart) allocationChart.destroy();
        
        allocationChart = new Chart(allocationCtx, {
            type: 'doughnut',
            data: {
                labels: ['טכנולוגיה', 'פיננסים', 'בריאות', 'אנרגיה', 'תעשייה', 'אחר'],
                datasets: [{
                    data: [35, 25, 15, 10, 10, 5],
                    backgroundColor: [
                        '#28a745',
                        '#007bff',
                        '#dc3545',
                        '#ffc107',
                        '#6f42c1',
                        '#6c757d'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'חלוקת נכסים לפי סקטורים'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Initialize Accounts Chart
    const accountsCtx = document.getElementById('accountsChart');
    if (accountsCtx && typeof Chart !== 'undefined') {
        if (accountsChart) accountsChart.destroy();
        
        accountsChart = new Chart(accountsCtx, {
            type: 'bar',
            data: {
                labels: ['חשבון USD', 'חשבון ILS', 'חשבון EUR', 'חשבון Crypto'],
                datasets: [{
                    label: 'תשואה שנתית (%)',
                    data: [12.5, 8.3, 15.2, 25.8],
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.8)',
                        'rgba(0, 123, 255, 0.8)',
                        'rgba(255, 193, 7, 0.8)',
                        'rgba(220, 53, 69, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'השוואת ביצועים בין חשבונות'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'תשואה (%)'
                        }
                    }
                }
            }
        });
    }
    
    // Initialize Risk Chart
    const riskCtx = document.getElementById('riskChart');
    if (riskCtx && typeof Chart !== 'undefined') {
        if (riskChart) riskChart.destroy();
        
        riskChart = new Chart(riskCtx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'מניות',
                    data: [
                        {x: 5, y: 8}, {x: 7, y: 12}, {x: 3, y: 6}, {x: 9, y: 15},
                        {x: 4, y: 7}, {x: 6, y: 10}, {x: 8, y: 14}, {x: 2, y: 4},
                        {x: 10, y: 18}, {x: 1, y: 3}, {x: 11, y: 20}, {x: 12, y: 22}
                    ],
                    backgroundColor: 'rgba(40, 167, 69, 0.6)',
                    borderColor: '#28a745'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'ניתוח סיכון מול תשואה לפי מניות'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'רמת סיכון (%)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'תשואה צפויה (%)'
                        }
                    }
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
window.quickAction = quickAction;
