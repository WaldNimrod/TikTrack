/**
 * Index Page JavaScript - TikTrack
 * עמוד הבית - JavaScript
 * 
 * @version 2.0.0
 * @lastUpdated January 2025
 * @author TikTrack Development Team
 */

console.log('🏠 Index page JavaScript loaded');

// Index page specific variables
let homeCharts = {
    tradesStatusChart: null,
    performanceChart: null,
    accountChart: null,
    mixedChart: null
};

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

// Chart Management Functions
async function createTradesStatusChart() {
    try {
        console.log('📊 Creating trades status chart...');
        
        if (!window.ChartSystem || !window.TradesAdapter) {
            console.warn('⚠️ Chart system or trades adapter not available');
            return;
        }
        
        const tradesAdapter = new window.TradesAdapter();
        const rawData = await tradesAdapter.getData();
        const chartData = tradesAdapter.formatData(rawData, 'status');
        
        homeCharts.tradesStatusChart = await window.ChartSystem.create({
            id: 'tradesStatusChart',
            type: 'doughnut',
            container: '#tradesStatusChart',
            title: 'סטטוס טריידים',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        display: true, 
                        position: 'bottom',
                        labels: { usePointStyle: true }
                    }
                }
            }
        });
        
        console.log('✅ Trades status chart created successfully');
    } catch (error) {
        console.error('❌ Error creating trades status chart:', error);
    }
}

async function createPerformanceChart() {
    try {
        console.log('📈 Creating performance chart...');
        
        if (!window.ChartSystem || !window.TradesAdapter) {
            console.warn('⚠️ Chart system or trades adapter not available');
            return;
        }
        
        const tradesAdapter = new window.TradesAdapter();
        const rawData = await tradesAdapter.getData();
        const chartData = tradesAdapter.formatData(rawData, 'performance');
        
        homeCharts.performanceChart = await window.ChartSystem.create({
            id: 'performanceChart',
            type: 'line',
            container: '#performanceChart',
            title: 'ביצועים לאורך זמן',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        title: { display: true, text: 'P/L' }
                    }
                }
            }
        });
        
        console.log('✅ Performance chart created successfully');
    } catch (error) {
        console.error('❌ Error creating performance chart:', error);
    }
}

async function createAccountChart() {
    try {
        console.log('🏦 Creating account chart...');
        
        if (!window.ChartSystem || !window.TradesAdapter) {
            console.warn('⚠️ Chart system or trades adapter not available');
            return;
        }
        
        const tradesAdapter = new window.TradesAdapter();
        const rawData = await tradesAdapter.getData();
        const chartData = tradesAdapter.formatData(rawData, 'account');
        
        homeCharts.accountChart = await window.ChartSystem.create({
            id: 'accountChart',
            type: 'bar',
            container: '#accountChart',
            title: 'התפלגות חשבונות',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        title: { display: true, text: 'מספר טריידים' }
                    }
                }
            }
        });
        
        console.log('✅ Account chart created successfully');
    } catch (error) {
        console.error('❌ Error creating account chart:', error);
    }
}

async function createMixedChart() {
    try {
        console.log('🔀 Creating mixed chart...');
        
        if (!window.ChartSystem || !window.TradesAdapter) {
            console.warn('⚠️ Chart system or trades adapter not available');
            return;
        }
        
        const tradesAdapter = new window.TradesAdapter();
        const rawData = await tradesAdapter.getData();
        const stats = tradesAdapter.getSummaryStats(rawData);
        
        const mixedData = createMixedChartData(rawData, stats);
        
        homeCharts.mixedChart = await window.ChartSystem.create({
            id: 'mixedChart',
            type: 'line',
            container: '#mixedChart',
            title: 'אנליטיקה מעורבת',
            data: mixedData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        title: { display: true, text: 'כמות / ערך' }
                    }
                },
                interaction: { intersect: false, mode: 'index' }
            }
        });
        
        console.log('✅ Mixed chart created successfully');
    } catch (error) {
        console.error('❌ Error creating mixed chart:', error);
    }
}

function createMixedChartData(rawData, stats) {
    if (!rawData.data || !Array.isArray(rawData.data)) {
        return { labels: [], datasets: [] };
    }
    
    const trades = rawData.data;
    const colorPalette = window.getChartColorPalette ? window.getChartColorPalette() : [
        '#1e40af', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6c757d', '#6f42c1', '#20c997'
    ];
    
    const labels = [
        'טריידים פתוחים', 'טריידים סגורים', 'טריידים מבוטלים',
        'חשבונות פעילים', 'ביצועים חיוביים', 'ביצועים שליליים',
        'סה"כ עסקאות', 'ממוצע P/L'
    ];
    
    const datasets = [
        {
            label: 'טריידים לפי סטטוס',
            data: [
                trades.filter(t => t.status === 'open').length,
                trades.filter(t => t.status === 'closed').length,
                trades.filter(t => t.status === 'cancelled').length,
                0, 0, 0, 0, 0
            ],
            borderColor: colorPalette[0] || '#1e40af',
            backgroundColor: window.getChartColorWithOpacity ? 
                window.getChartColorWithOpacity('primary', 0.2) : 'rgba(30, 64, 175, 0.2)',
            tension: 0.1,
            fill: false
        },
        {
            label: 'חשבונות ופעילות',
            data: [
                0, 0, 0,
                new Set(trades.map(t => t.account_id)).size,
                trades.filter(t => t.pnl && parseFloat(t.pnl) > 0).length,
                trades.filter(t => t.pnl && parseFloat(t.pnl) < 0).length,
                0, 0
            ],
            borderColor: colorPalette[1] || '#28a745',
            backgroundColor: window.getChartColorWithOpacity ? 
                window.getChartColorWithOpacity('success', 0.2) : 'rgba(40, 167, 69, 0.2)',
            tension: 0.1,
            fill: false
        },
        {
            label: 'סטטיסטיקות כלליות',
            data: [
                0, 0, 0, 0, 0, 0,
                stats.totalTrades,
                Math.round(stats.averagePL * 100) / 100
            ],
            borderColor: colorPalette[2] || '#ffc107',
            backgroundColor: window.getChartColorWithOpacity ? 
                window.getChartColorWithOpacity('warning', 0.2) : 'rgba(255, 193, 7, 0.2)',
            tension: 0.1,
            fill: false
        }
    ];
    
    return { labels: labels, datasets: datasets };
}

// Chart Management Functions
async function refreshAllCharts() {
    console.log('🔄 Refreshing all charts...');
    
    try {
        await Promise.all([
            createTradesStatusChart(),
            createPerformanceChart(),
            createAccountChart(),
            createMixedChart()
        ]);
        
        if (window.showNotification) {
            window.showNotification('success', 'כל הגרפים רוענו בהצלחה');
        }
        
        console.log('✅ All charts refreshed successfully');
    } catch (error) {
        console.error('❌ Error refreshing charts:', error);
        if (window.showNotification) {
            window.showNotification('error', 'שגיאה ברענון הגרפים');
        }
    }
}

async function refreshChart(chartId) {
    console.log(`🔄 Refreshing chart: ${chartId}`);
    
    try {
        switch (chartId) {
            case 'tradesStatusChart':
                await createTradesStatusChart();
                break;
            case 'performanceChart':
                await createPerformanceChart();
                break;
            case 'accountChart':
                await createAccountChart();
                break;
            case 'mixedChart':
                await createMixedChart();
                break;
            default:
                console.warn(`⚠️ Unknown chart ID: ${chartId}`);
                return;
        }
        
        if (window.showNotification) {
            window.showNotification('success', `גרף ${chartId} רוענן בהצלחה`);
        }
        
        console.log(`✅ Chart ${chartId} refreshed successfully`);
    } catch (error) {
        console.error(`❌ Error refreshing chart ${chartId}:`, error);
        if (window.showNotification) {
            window.showNotification('error', `שגיאה ברענון גרף ${chartId}`);
        }
    }
}

async function exportChart(chartId) {
    console.log(`📤 Exporting chart: ${chartId}`);
    
    try {
        if (window.ChartExportSystem) {
            await window.ChartExportSystem.exportChart(chartId, {
                format: 'png',
                quality: 'high',
                filename: `home-${chartId}`
            });
        } else {
            console.warn('⚠️ Chart export system not available');
            if (window.showNotification) {
                window.showNotification('info', 'מערכת ייצוא הגרפים לא זמינה');
            }
        }
    } catch (error) {
        console.error(`❌ Error exporting chart ${chartId}:`, error);
        if (window.showNotification) {
            window.showNotification('error', `שגיאה בייצוא גרף ${chartId}`);
        }
    }
}

async function exportAllCharts() {
    console.log('📤 Exporting all charts...');
    
    try {
        if (window.ChartExportSystem) {
            const chartIds = Object.keys(homeCharts).filter(id => homeCharts[id] !== null);
            await window.ChartExportSystem.exportMultipleCharts(chartIds, {
                format: 'png',
                quality: 'high',
                filename: 'home-dashboard'
            });
        } else {
            console.warn('⚠️ Chart export system not available');
            if (window.showNotification) {
                window.showNotification('info', 'מערכת ייצוא הגרפים לא זמינה');
            }
        }
    } catch (error) {
        console.error('❌ Error exporting all charts:', error);
        if (window.showNotification) {
            window.showNotification('error', 'שגיאה בייצוא כל הגרפים');
        }
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
    
    // Initialize charts after a short delay to ensure all systems are loaded
    setTimeout(async () => {
        console.log('📊 Initializing home page charts...');
        await refreshAllCharts();
    }, 1000);
});

// Export functions to global scope
window.switchTableTab = switchTableTab;
window.refreshOverview = refreshOverview;
window.exportOverview = exportOverview;
window.quickAction = quickAction;
window.toggleAllSections = toggleAllSections;
window.toggleSection = toggleSection;

// Chart functions
window.refreshAllCharts = refreshAllCharts;
window.refreshChart = refreshChart;
window.exportChart = exportChart;
window.exportAllCharts = exportAllCharts;

console.log('✅ Index page ready');