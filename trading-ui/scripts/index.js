// Index page specific JavaScript

// Function to wait for Chart.js to load
function waitForChartJS() {
    return new Promise((resolve, reject) => {
        if (typeof Chart !== 'undefined') {
            resolve();
            return;
        }
        
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        const checkChart = () => {
            attempts++;
            if (typeof Chart !== 'undefined') {
                resolve();
            } else if (attempts >= maxAttempts) {
                reject(new Error('Chart.js failed to load'));
            } else {
                setTimeout(checkChart, 100);
            }
        };
        
        checkChart();
    });
}

// Chart.js library needed for charts
if (typeof Chart === 'undefined') {
    console.log('📊 Chart.js will be loaded dynamically');
}

// Chart instances
let performanceChart = null;
let allocationChart = null;
let accountsChart = null;
let riskChart = null;

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

// Function to update chart period
function updateChartPeriod(period) {
    // Chart update logic would go here
}

// Function to refresh charts
function refreshCharts() {
    initializeCharts();
}

// Function to initialize all charts
function initializeCharts() {
    
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
    // Overview refresh logic would go here
}

// Function to export overview
function exportOverview() {
    // Export logic would go here
}

// Function to export specific chart
function exportChart(chartType) {
    
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
            return;
    }
    
    if (chart) {
        // Create download link
        const link = document.createElement('a');
        link.download = filename;
        link.href = chart.toBase64Image();
        link.click();
        
    } else {
    }
}

// Function for quick actions
function quickAction(action) {
    
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
            break;
        case 'reports':
            break;
        case 'preferences-new':
            window.location.href = 'preferences-new.html';
            break;
        case 'settings':
            window.location.href = 'preferences.html';
            break;
        case 'documentation':
            window.open('../JAVASCRIPT_SCRIPTS_ARCHITECTURE.md', '_blank');
            break;
        default:
    }
}

// Load action buttons for tables
function loadActionButtons() {
    
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
        
    } else {
    }
}

// Initialize page after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    
    
    // Load action buttons after a short delay to ensure UI utils are loaded
    setTimeout(loadActionButtons, 500);
    
    // Initialize charts after Chart.js is loaded
    waitForChartJS().then(() => {
        initializeCharts();
    }).catch(() => {
        console.warn('Chart.js not available - charts disabled');
    });
    
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
