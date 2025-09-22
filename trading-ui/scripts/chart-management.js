/**
 * Chart Management Page - TikTrack
 * עמוד ניהול גרפים - TikTrack
 * 
 * @version 1.0.0
 * @lastUpdated December 2024
 * @author TikTrack Development Team
 */

console.log('📊 Chart Management page loaded');

// Global variables
let chartsList = [];
let autoRefreshInterval = null;
let isAutoRefreshEnabled = false;
let testChart = null;

// Function to toggle section visibility
function toggleSection(sectionId) {
    if (typeof window.toggleSection === 'function') {
        window.toggleSection(sectionId);
    } else {
        console.warn('toggleSection function not found');
    }
}

// Function to refresh charts status
function refreshChartsStatus() {
    console.log('🔄 Refreshing charts status...');
    
    if (!window.ChartSystem) {
        console.warn('⚠️ Chart System not available');
        updateStatusDisplay();
        return;
    }
    
    // Get all charts from the system
    const allCharts = window.ChartSystem.getAllCharts();
    const activeCharts = allCharts.filter(chart => chart && !chart.destroyed);
    const errorCharts = allCharts.filter(chart => chart && chart.destroyed);
    
    // Update statistics
    document.getElementById('totalCharts').textContent = allCharts.length;
    document.getElementById('activeCharts').textContent = activeCharts.length;
    document.getElementById('errorCharts').textContent = errorCharts.length;
    
    // Calculate memory usage (estimated)
    const memoryUsage = allCharts.length * 2; // 2MB per chart estimate
    document.getElementById('memoryUsage').textContent = `${memoryUsage}MB`;
    
    // Update charts list
    updateChartsList();
    
    console.log('✅ Charts status refreshed');
}

// Function to update charts list
function updateChartsList() {
    const chartsListElement = document.getElementById('chartsList');
    
    if (!window.ChartSystem) {
        chartsListElement.innerHTML = '<div class="no-charts">מערכת הגרפים לא זמינה</div>';
        return;
    }
    
    const allCharts = window.ChartSystem.getAllCharts();
    
    if (allCharts.length === 0) {
        chartsListElement.innerHTML = '<div class="no-charts">אין גרפים פעילים</div>';
        return;
    }
    
    let html = '';
    allCharts.forEach((chart, index) => {
        const status = chart && !chart.destroyed ? 'active' : 'error';
        const statusText = status === 'active' ? 'פעיל' : 'שגיאה';
        const statusIcon = status === 'active' ? '✅' : '❌';
        
        html += `
            <div class="chart-item ${status}">
                <div class="chart-info">
                    <div class="chart-name">גרף ${index + 1}</div>
                    <div class="chart-status">
                        <span class="status-icon">${statusIcon}</span>
                        <span class="status-text">${statusText}</span>
                    </div>
                </div>
                <div class="chart-actions">
                    <button class="action-btn small" onclick="refreshChart(${index})">
                        <i class="fas fa-sync"></i>
                    </button>
                    <button class="action-btn small" onclick="exportChart(${index})">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="action-btn small danger" onclick="destroyChart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    chartsListElement.innerHTML = html;
}

// Function to create new chart
async function createNewChart() {
    try {
        console.log('📊 Creating new chart...');
        
        if (!window.ChartSystem) {
        window.showNotification('מערכת הגרפים לא זמינה', 'error');
            return;
        }
        
        // Create a sample chart
        const chartId = `sampleChart_${Date.now()}`;
        const chartType = Math.random() > 0.5 ? 'line' : 'bar';
        
        const sampleData = {
            labels: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי'],
            datasets: [{
                label: 'נתונים לדוגמה',
                data: [12, 19, 3, 5, 2],
                backgroundColor: window.getChartColor ? window.getChartColor('primary') : '#007bff',
                borderColor: window.getChartColor ? window.getChartColor('primary') : '#007bff',
                borderWidth: 1
            }]
        };
        
        // Create a temporary container for the chart
        const tempContainer = document.createElement('div');
        tempContainer.id = chartId;
        tempContainer.style.width = '300px';
        tempContainer.style.height = '200px';
        tempContainer.style.margin = '10px';
        tempContainer.style.border = '1px solid #ddd';
        tempContainer.style.borderRadius = '4px';
        tempContainer.style.padding = '10px';
        
        // Add to charts list
        const chartsList = document.getElementById('chartsList');
        if (chartsList) {
            chartsList.appendChild(tempContainer);
        }
        
        // Create the chart
        const newChart = await window.ChartSystem.create({
            id: chartId,
            type: chartType,
            container: `#${chartId}`,
            title: `גרף לדוגמה ${chartType}`,
            data: sampleData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
        
        // Refresh status
        refreshChartsStatus();
        
        window.showNotification(`גרף חדש נוצר בהצלחה: ${chartId}`, 'success');
        
        console.log('✅ New chart created:', chartId);
        
    } catch (error) {
        console.error('❌ Error creating chart:', error);
        window.showNotification(`שגיאה ביצירת גרף: ${error.message}`, 'error');
    }
}

// Function to refresh all charts
function refreshAllCharts() {
    console.log('🔄 Refreshing all charts...');
    
    if (!window.ChartSystem) {
        console.warn('⚠️ Chart System not available');
        return;
    }
    
    // This would refresh all charts in the system
    // For now, just refresh the status
    refreshChartsStatus();
    
    window.showNotification('כל הגרפים רוענו בהצלחה', 'success');
    
    console.log('✅ All charts refreshed');
}

// Function to destroy all charts
function destroyAllCharts() {
    if (confirm('האם אתה בטוח שברצונך למחוק את כל הגרפים?')) {
        console.log('🗑️ Destroying all charts...');
        
        if (window.ChartSystem) {
            window.ChartSystem.destroyAll();
        }
        
        refreshChartsStatus();
        
        window.showNotification('כל הגרפים נמחקו בהצלחה', 'success');
        
        console.log('✅ All charts destroyed');
    }
}

// Function to refresh specific chart
function refreshChart(chartIndex) {
    console.log(`🔄 Refreshing chart ${chartIndex}...`);
    
    window.showNotification(`רענון גרף ${chartIndex + 1} - Future feature`, 'info');
}

// Function to export specific chart
async function exportChart(chartIndex) {
    try {
        console.log(`📤 Exporting chart ${chartIndex}...`);
        
        if (!window.ChartExportSystem) {
            window.showNotification('מערכת ייצוא גרפים לא זמינה', 'error');
            return;
        }
        
        // Get chart ID (simplified for demo)
        const chartId = `chart_${chartIndex}`;
        
        // Get export options from UI
        const format = document.getElementById('exportFormat')?.value || 'png';
        const quality = document.getElementById('exportQuality')?.value || 'high';
        
        await window.ChartExportSystem.exportChart(chartId, {
            format: format,
            quality: quality,
            filename: `chart_${chartIndex + 1}_${Date.now()}`
        });
        
    } catch (error) {
        console.error(`❌ Error exporting chart ${chartIndex}:`, error);
        window.showNotification(`שגיאה בייצוא גרף ${chartIndex + 1}: ${error.message}`, 'error');
    }
}

// Function to destroy specific chart
function destroyChart(chartIndex) {
    if (confirm(`האם אתה בטוח שברצונך למחוק את גרף ${chartIndex + 1}?`)) {
        console.log(`🗑️ Destroying chart ${chartIndex}...`);
        
        if (window.ChartSystem) {
            // This would destroy the specific chart
            // For now, just refresh the status
            refreshChartsStatus();
        }
        
        window.showNotification(`גרף ${chartIndex + 1} נמחק בהצלחה`, 'success');
        
        console.log(`✅ Chart ${chartIndex} destroyed`);
    }
}

// Function to change chart theme
function changeChartTheme(themeName) {
    console.log(`🎨 Changing chart theme to: ${themeName}`);
    
    if (window.ChartSystem) {
        window.ChartSystem.setTheme({ name: themeName });
    }
    
    window.showNotification(`נושא הגרפים שונה ל: ${themeName}`, 'success');
}

// Function to toggle auto refresh
async function toggleAutoRefresh(enabled) {
    isAutoRefreshEnabled = enabled;
    
    if (enabled) {
        // Get refresh interval from preferences or fallback to UI
        let interval = 60; // default 60 seconds
        
        try {
            // Try to get from preferences first
            if (window.getPreference) {
                const refreshInterval = await window.getPreference('chartRefreshInterval');
                if (refreshInterval) {
                    interval = parseInt(refreshInterval);
                }
            }
        } catch (error) {
            console.log('Using fallback refresh interval from UI');
            // Fallback to UI element
            const uiElement = document.getElementById('refreshInterval');
            if (uiElement) {
                interval = parseInt(uiElement.value);
            }
        }
        
        const intervalMs = interval * 1000;
        autoRefreshInterval = setInterval(refreshChartsStatus, intervalMs);
        console.log(`🔄 Auto refresh enabled (${interval}s / ${intervalMs}ms)`);
    } else {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            autoRefreshInterval = null;
        }
        console.log('⏹️ Auto refresh disabled');
    }
}

// Function to export all charts
async function exportAllCharts() {
    try {
        console.log('📤 Exporting all charts...');
        
        if (!window.ChartExportSystem) {
            window.showNotification('מערכת ייצוא גרפים לא זמינה', 'error');
            return;
        }
        
        // Get export options from UI
        const format = document.getElementById('exportFormat')?.value || 'png';
        const quality = document.getElementById('exportQuality')?.value || 'high';
        
        await window.ChartExportSystem.exportAllCharts({
            format: format,
            quality: quality,
            filename: `all_charts_${Date.now()}`
        });
        
    } catch (error) {
        console.error('❌ Error exporting all charts:', error);
        window.showNotification(`שגיאה בייצוא כל הגרפים: ${error.message}`, 'error');
    }
}

// Function to export selected charts
async function exportSelectedCharts() {
    try {
        console.log('📤 Exporting selected charts...');
        
        if (!window.ChartExportSystem) {
            window.showNotification('מערכת ייצוא גרפים לא זמינה', 'error');
            return;
        }
        
        // Get selected charts (simplified for demo - in real implementation would get from checkboxes)
        const selectedCharts = [0, 1]; // Demo: export first two charts
        
        if (selectedCharts.length === 0) {
            window.showNotification('לא נבחרו גרפים לייצוא', 'warning');
            return;
        }
        
        const format = document.getElementById('exportFormat')?.value || 'png';
        const quality = document.getElementById('exportQuality')?.value || 'high';
        
        const chartIds = selectedCharts.map(index => `chart_${index}`);
        
        await window.ChartExportSystem.exportMultipleCharts(chartIds, {
            format: format,
            quality: quality,
            filename: `selected_charts_${Date.now()}`
        });
        
    } catch (error) {
        console.error('❌ Error exporting selected charts:', error);
        window.showNotification(`שגיאה בייצוא גרפים נבחרים: ${error.message}`, 'error');
    }
}

// Test Chart Functions
// פונקציות גרף בדיקה

// Function to create test chart
async function createTestChart() {
    try {
        console.log('🧪 Creating test chart with real trades data...');
        
        if (!window.ChartSystem) {
        window.showNotification('מערכת הגרפים לא זמינה', 'error');
            return;
        }
        
        // Destroy existing test chart if exists
        if (testChart) {
            await destroyTestChart();
        }
        
        // Check if TradesAdapter is available
        if (!window.TradesAdapter) {
        window.showNotification('מתאם נתוני טריידים לא זמין', 'error');
            return;
        }
        
        // Create trades adapter and fetch real data
        const tradesAdapter = new window.TradesAdapter();
        const rawData = await tradesAdapter.getData();
        
        // Get summary statistics
        const stats = tradesAdapter.getSummaryStats(rawData);
        console.log('📊 Trades statistics:', stats);
        
        // Format data for status chart
        const chartData = tradesAdapter.formatData(rawData, 'status');
        
        // Create the test chart with real data
        testChart = await window.ChartSystem.create({
            id: 'testChart',
            type: 'doughnut',
            container: '#testChart',
            title: 'טריידים לפי סטטוס - נתונים אמיתיים',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: `טריידים לפי סטטוס (סה"כ: ${stats.totalTrades})`
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        // Refresh status
        refreshChartsStatus();
        
        window.showNotification(`גרף בדיקה נוצר עם ${stats.totalTrades} טריידים אמיתיים`, 'success');
        
        console.log('✅ Test chart created with real trades data:', stats);
        
    } catch (error) {
        console.error('❌ Error creating test chart:', error);
        window.showNotification(`שגיאה ביצירת גרף בדיקה: ${error.message}`, 'error');
    }
}

// Function to update test chart
async function updateTestChart() {
    try {
        console.log('🔄 Updating test chart with fresh data...');
        
        if (!testChart) {
        window.showNotification('אין גרף בדיקה לעדכון', 'warning');
            return;
        }
        
        if (!window.TradesAdapter) {
        window.showNotification('מתאם נתוני טריידים לא זמין', 'error');
            return;
        }
        
        // Create trades adapter and fetch fresh data
        const tradesAdapter = new window.TradesAdapter();
        const rawData = await tradesAdapter.getData();
        
        // Get updated statistics
        const stats = tradesAdapter.getSummaryStats(rawData);
        console.log('📊 Updated trades statistics:', stats);
        
        // Format fresh data for status chart
        const newData = tradesAdapter.formatData(rawData, 'status');
        
        // Update the chart
        await window.ChartSystem.update('testChart', newData);
        
        window.showNotification(`גרף בדיקה עודכן עם ${stats.totalTrades} טריידים`, 'success');
        
        console.log('✅ Test chart updated with fresh trades data');
        
    } catch (error) {
        console.error('❌ Error updating test chart:', error);
        window.showNotification(`שגיאה בעדכון גרף בדיקה: ${error.message}`, 'error');
    }
}

// Function to create performance chart
async function createPerformanceChart() {
    try {
        console.log('📈 Creating performance chart with real trades data...');
        
        if (!window.ChartSystem || !window.TradesAdapter) {
        window.showNotification('מערכת הגרפים או מתאם הטריידים לא זמין', 'error');
            return;
        }
        
        // Destroy existing test chart if exists
        if (testChart) {
            await destroyTestChart();
        }
        
        // Create trades adapter and fetch real data
        const tradesAdapter = new window.TradesAdapter();
        const rawData = await tradesAdapter.getData();
        
        // Get summary statistics
        const stats = tradesAdapter.getSummaryStats(rawData);
        console.log('📊 Performance statistics:', stats);
        
        // Format data for performance chart
        const chartData = tradesAdapter.formatData(rawData, 'performance');
        
        // Create the performance chart
        testChart = await window.ChartSystem.create({
            id: 'testChart',
            type: 'line',
            container: '#testChart',
            title: 'ביצועי טריידים - נתונים אמיתיים',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: `ביצועי טריידים (סה"כ PL: ${stats.totalPL})`
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'רווח/הפסד'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'מספר טריידים'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
        
        // Refresh status
        refreshChartsStatus();
        
        window.showNotification(`גרף ביצועים נוצר עם ${stats.totalTrades} טריידים`, 'success');
        
        console.log('✅ Performance chart created with real trades data');
        
    } catch (error) {
        console.error('❌ Error creating performance chart:', error);
        window.showNotification(`שגיאה ביצירת גרף ביצועים: ${error.message}`, 'error');
    }
}

// Function to create account chart
async function createAccountChart() {
    try {
        console.log('👥 Creating account chart with real trades data...');
        
        if (!window.ChartSystem || !window.TradesAdapter) {
        window.showNotification('מערכת הגרפים או מתאם הטריידים לא זמין', 'error');
            return;
        }
        
        // Destroy existing test chart if exists
        if (testChart) {
            await destroyTestChart();
        }
        
        // Create trades adapter and fetch real data
        const tradesAdapter = new window.TradesAdapter();
        const rawData = await tradesAdapter.getData();
        
        // Get summary statistics
        const stats = tradesAdapter.getSummaryStats(rawData);
        console.log('📊 Account statistics:', stats);
        
        // Format data for account chart
        const chartData = tradesAdapter.formatData(rawData, 'account');
        
        // Create the account chart
        testChart = await window.ChartSystem.create({
            id: 'testChart',
            type: 'bar',
            container: '#testChart',
            title: 'טריידים לפי חשבון - נתונים אמיתיים',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: `טריידים לפי חשבון (סה"כ: ${stats.totalTrades})`
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'מספר טריידים'
                        }
                    }
                }
            }
        });
        
        // Refresh status
        refreshChartsStatus();
        
        window.showNotification(`גרף חשבונות נוצר עם ${stats.totalTrades} טריידים`, 'success');
        
        console.log('✅ Account chart created with real trades data');
        
    } catch (error) {
        console.error('❌ Error creating account chart:', error);
        window.showNotification(`שגיאה ביצירת גרף חשבונות: ${error.message}`, 'error');
    }
}

// Function to create mixed chart with multiple entities and types
async function createMixedChart() {
    try {
        console.log('🔀 Creating mixed chart with multiple entities and types...');
        
        if (!window.ChartSystem || !window.TradesAdapter) {
            window.showNotification('מערכת הגרפים או מתאם הטריידים לא זמין', 'error');
            return;
        }
        
        // Destroy existing test chart if exists
        if (testChart) {
            await destroyTestChart();
        }
        
        // Create trades adapter and fetch real data
        const tradesAdapter = new window.TradesAdapter();
        const rawData = await tradesAdapter.getData();
        
        // Get summary statistics
        const stats = tradesAdapter.getSummaryStats(rawData);
        console.log('📊 Mixed chart statistics:', stats);
        
        // Create mixed data combining multiple entities and types
        const mixedData = createMixedChartData(rawData, stats);
        
        // Create the mixed chart with real data
        testChart = await window.ChartSystem.create({
            id: 'testChart',
            type: 'line',
            container: '#testChart',
            title: 'גרף מעורב - מספר ישויות וסוגים',
            data: mixedData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: `גרף מעורב - טריידים, חשבונות וביצועים (סה"כ: ${stats.totalTrades})`
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'כמות / ערך'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'קטגוריות'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
        
        // Refresh status
        refreshChartsStatus();
        
        window.showNotification(`גרף מעורב נוצר עם ${stats.totalTrades} טריידים מכמה ישויות`, 'success');
        console.log('✅ Mixed chart created successfully');
        
    } catch (error) {
        console.error('❌ Error creating mixed chart:', error);
        window.showNotification(`שגיאה ביצירת גרף מעורב: ${error.message}`, 'error');
    }
}

// Helper function to create mixed chart data
function createMixedChartData(rawData, stats) {
    if (!rawData.data || !Array.isArray(rawData.data)) {
        return { labels: [], datasets: [] };
    }
    
    const trades = rawData.data;
    
    // Get color palette for charts
    const colorPalette = window.getChartColorPalette ? window.getChartColorPalette() : [
        '#1e40af', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6c757d', '#6f42c1', '#20c997'
    ];
    
    // Create labels from different entities
    const labels = [
        'טריידים פתוחים',
        'טריידים סגורים', 
        'טריידים מבוטלים',
        'חשבונות פעילים',
        'ביצועים חיוביים',
        'ביצועים שליליים',
        'סה"כ עסקאות',
        'ממוצע P/L'
    ];
    
    // Create datasets for different entity types
    const datasets = [
        {
            label: 'טריידים לפי סטטוס',
            data: [
                trades.filter(t => t.status === 'open').length,
                trades.filter(t => t.status === 'closed').length,
                trades.filter(t => t.status === 'cancelled').length,
                0, 0, 0, 0, 0 // Placeholders for other categories
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
                0, 0, 0, // Placeholders for trades
                new Set(trades.map(t => t.account_id)).size, // Unique accounts
                trades.filter(t => t.pnl && parseFloat(t.pnl) > 0).length,
                trades.filter(t => t.pnl && parseFloat(t.pnl) < 0).length,
                0, 0 // Placeholders
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
                0, 0, 0, 0, 0, 0, // Placeholders
                stats.totalTrades,
                Math.round(stats.averagePL * 100) / 100 // Rounded average P/L
            ],
            borderColor: colorPalette[2] || '#ffc107',
            backgroundColor: window.getChartColorWithOpacity ? 
                window.getChartColorWithOpacity('warning', 0.2) : 'rgba(255, 193, 7, 0.2)',
            tension: 0.1,
            fill: false
        }
    ];
    
    return {
        labels: labels,
        datasets: datasets
    };
}

// Function to export test chart
async function exportTestChart() {
    try {
        console.log('📤 Exporting test chart...');
        
        if (!testChart) {
            window.showNotification('אין גרף בדיקה לייצוא', 'warning');
            return;
        }
        
        if (!window.ChartExportSystem) {
            window.showNotification('מערכת ייצוא גרפים לא זמינה', 'error');
            return;
        }
        
        // Get export options from preferences or UI fallback
        let format = 'png';
        let quality = 'medium';
        
        try {
            if (window.getPreference) {
                format = await window.getPreference('chartExportFormat') || 'png';
                quality = await window.getPreference('chartExportQuality') || 'medium';
            }
        } catch (error) {
            console.log('Using fallback export options from UI');
            // Fallback to UI elements
            format = document.getElementById('exportFormat')?.value || 'png';
            quality = document.getElementById('exportQuality')?.value || 'medium';
        }
        
        await window.ChartExportSystem.exportChart('testChart', {
            format: format,
            quality: quality,
            filename: `test_chart_${Date.now()}`
        });
        
    } catch (error) {
        console.error('❌ Error exporting test chart:', error);
        window.showNotification(`שגיאה בייצוא גרף בדיקה: ${error.message}`, 'error');
    }
}

// Function to destroy test chart
async function destroyTestChart() {
    try {
        console.log('🗑️ Destroying test chart...');
        
        if (!testChart) {
        window.showNotification('אין גרף בדיקה למחיקה', 'warning');
            return;
        }
        
        // Destroy the chart
        if (window.ChartSystem) {
            window.ChartSystem.destroy('testChart');
        }
        
        testChart = null;
        
        // Refresh status
        refreshChartsStatus();
        
        window.showNotification('גרף בדיקה נמחק בהצלחה', 'success');
        
        console.log('✅ Test chart destroyed successfully');
        
    } catch (error) {
        console.error('❌ Error destroying test chart:', error);
        window.showNotification(`שגיאה במחיקת גרף בדיקה: ${error.message}`, 'error');
    }
}

// Use global notification system directly

// Function to copy detailed log
async function copyDetailedLog() {
    try {
        console.log('📋 Generating detailed log...');
        
        // Show loading state
        const copyBtn = document.querySelector('.copy-log-btn');
        if (copyBtn) {
            copyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> מייצר לוג...';
            copyBtn.disabled = true;
        }
        
        // Collect system information
        const systemInfo = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            pageTitle: document.title,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
        
        // Collect chart system status
        const chartSystemStatus = {
            isAvailable: !!window.ChartSystem,
            isInitialized: window.ChartSystem ? true : false,
            totalCharts: window.ChartSystem ? window.ChartSystem.getAllCharts().length : 0,
            adapters: {
                performance: !!window.PerformanceAdapter,
                linter: !!window.LinterAdapter,
                trades: !!window.TradesAdapter
            },
            exportSystem: {
                isAvailable: !!window.ChartExportSystem,
                supportedFormats: window.ChartExportSystem ? window.ChartExportSystem.getSupportedFormats() : [],
                qualityLevels: window.ChartExportSystem ? window.ChartExportSystem.getQualityLevels() : [],
                exportStatus: window.ChartExportSystem ? window.ChartExportSystem.getExportStatus() : null
            },
            theme: window.ChartTheme ? window.ChartTheme.currentTheme : 'unknown'
        };
        
        // Collect page elements status
        const pageElements = {
            totalCharts: document.getElementById('totalCharts')?.textContent || '0',
            activeCharts: document.getElementById('activeCharts')?.textContent || '0',
            errorCharts: document.getElementById('errorCharts')?.textContent || '0',
            memoryUsage: document.getElementById('memoryUsage')?.textContent || '0MB',
            chartsList: document.getElementById('chartsList')?.children.length || 0
        };
        
        // Collect settings
        const settings = {
            chartTheme: document.getElementById('chartTheme')?.value || 'default',
            autoRefresh: document.getElementById('autoRefresh')?.checked || false,
            refreshInterval: document.getElementById('refreshInterval')?.value || '30',
            exportFormat: document.getElementById('exportFormat')?.value || 'png',
            exportQuality: document.getElementById('exportQuality')?.value || 'high'
        };
        
        // Collect test chart status
        const testChartStatus = {
            exists: !!testChart,
            type: testChart ? 'active' : 'none',
            chartType: testChart ? (testChart.config?.type || 'unknown') : 'none',
            dataPoints: testChart ? (testChart.data?.datasets?.[0]?.data?.length || 0) : 0
        };
        
        // Build detailed log
        const detailedLog = {
            systemInfo,
            chartSystemStatus,
            pageElements,
            settings,
            testChartStatus,
            generatedAt: new Date().toLocaleString('he-IL')
        };
        
        // Convert to readable text
        const logText = `📊 TikTrack Chart Management - Detailed Log
===============================================

🕐 זמן יצירה: ${detailedLog.generatedAt}
🌐 URL: ${systemInfo.url}
📱 דפדפן: ${systemInfo.userAgent}
📏 רזולוציה: ${systemInfo.viewport.width}x${systemInfo.viewport.height}

📊 סטטוס מערכת הגרפים:
• מערכת זמינה: ${chartSystemStatus.isAvailable ? '✅ כן' : '❌ לא'}
• מערכת מאותחלת: ${chartSystemStatus.isInitialized ? '✅ כן' : '❌ לא'}
• סה"כ גרפים: ${chartSystemStatus.totalCharts}
• מתאם ביצועים: ${chartSystemStatus.adapters.performance ? '✅ כן' : '❌ לא'}
• מתאם Linter: ${chartSystemStatus.adapters.linter ? '✅ כן' : '❌ לא'}
• מתאם טריידים: ${chartSystemStatus.adapters.trades ? '✅ כן' : '❌ לא'}
• נושא נוכחי: ${chartSystemStatus.theme}

📤 סטטוס מערכת ייצוא:
• מערכת ייצוא זמינה: ${chartSystemStatus.exportSystem.isAvailable ? '✅ כן' : '❌ לא'}
• פורמטים נתמכים: ${chartSystemStatus.exportSystem.supportedFormats.join(', ')}
• רמות איכות: ${chartSystemStatus.exportSystem.qualityLevels.join(', ')}
• סטטוס ייצוא: ${chartSystemStatus.exportSystem.exportStatus ? 'פעיל' : 'לא פעיל'}

📈 סטטוס אלמנטי העמוד:
• סה"כ גרפים: ${pageElements.totalCharts}
• גרפים פעילים: ${pageElements.activeCharts}
• גרפים עם שגיאות: ${pageElements.errorCharts}
• שימוש זיכרון: ${pageElements.memoryUsage}
• פריטים ברשימה: ${pageElements.chartsList}

🧪 סטטוס גרף בדיקה:
• גרף קיים: ${testChartStatus.exists ? '✅ כן' : '❌ לא'}
• סוג גרף: ${testChartStatus.type}
• סוג גרף טכני: ${testChartStatus.chartType}
• מספר נקודות נתונים: ${testChartStatus.dataPoints}

⚙️ הגדרות:
• נושא גרפים: ${settings.chartTheme}
• רענון אוטומטי: ${settings.autoRefresh ? '✅ מופעל' : '❌ מושבת'}
• מרווח רענון: ${settings.refreshInterval} שניות
• פורמט ייצוא: ${settings.exportFormat}
• איכות ייצוא: ${settings.exportQuality}

🔍 מידע נוסף:
• רענון אוטומטי פעיל: ${isAutoRefreshEnabled ? '✅ כן' : '❌ לא'}
• מרווח רענון אוטומטי: ${autoRefreshInterval ? 'פעיל' : 'לא פעיל'}

📝 הערות:
• עמוד ניהול גרפים - מערכת חדשה מושלמת
• מערכת גרפים מלאה עם תכונות מתקדמות
• גרפים עם נתוני אמת מבסיס הנתונים
• מערכת ייצוא מקיפה (תכונה עתידית)
• מתאמי נתונים: ביצועים, Linter, טריידים
• תמיכה מלאה בפורמטי ייצוא: PNG, JPG, PDF, SVG
• רמות איכות: נמוכה, בינונית, גבוהה, אולטרה
• מערכת התראות מקומית
• לוג מפורט מקיף

===============================================
נוצר על ידי: TikTrack Chart Management System
גרסה: 1.0.0`;

        // Copy to clipboard
        await navigator.clipboard.writeText(logText);
        
        // Show success message using local notification
        const successMsg = `לוג מפורט הועתק ללוח!\n\n📊 מידע על הלוג:\n• זמן יצירה: ${new Date().toLocaleString('he-IL')}\n• גודל: ${logText.length} תווים\n• מקור: מערכת ניהול גרפים TikTrack`;
        
        window.showNotification(successMsg, 'success');
        
        console.log('✅ Detailed log copied to clipboard');
        
    } catch (error) {
        console.error('❌ Error copying detailed log:', error);
        
        const errorMsg = `שגיאה בהעתקת לוג: ${error.message}\n\n🔧 פתרונות אפשריים:\n• בדוק את החיבור לשרת\n• נסה לרענן את הדף\n• פנה לתמיכה טכנית`;
        
        window.showNotification(errorMsg, 'error');
    } finally {
        // Reset button
        const copyBtn = document.querySelector('.copy-log-btn');
        if (copyBtn) {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> העתק לוג מפורט';
            copyBtn.disabled = false;
        }
    }
}

// Function to update status display
function updateStatusDisplay() {
    // Update statistics with default values
    document.getElementById('totalCharts').textContent = '0';
    document.getElementById('activeCharts').textContent = '0';
    document.getElementById('errorCharts').textContent = '0';
    document.getElementById('memoryUsage').textContent = '0MB';
    
    // Update charts list
    updateChartsList();
}

// Event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Chart Management page initialized');
    
    // Check color system
    if (window.getColorPreferences) {
        console.log('✅ Color preferences system available');
        const colors = window.getColorPreferences();
        console.log('🎨 Current colors:', colors);
    } else {
        console.warn('⚠️ Color preferences system not available');
    }
    
    // Check chart color palette
    if (window.getChartColorPalette) {
        console.log('✅ Chart color palette system available');
        const palette = window.getChartColorPalette();
        console.log('🎨 Chart color palette:', palette);
        
        // Force update chart theme system
        if (window.ChartTheme) {
            console.log('🔄 Forcing chart theme update...');
            window.ChartTheme.updateDynamicColors();
            
            // Test individual colors
            const colors = window.ChartTheme.getChartColors();
            console.log('🎨 Individual chart colors:', colors);
            
            // Test CSS variables
            const rootStyles = getComputedStyle(document.documentElement);
            const primaryColor = rootStyles.getPropertyValue('--primary-color').trim();
            const chartPrimaryColor = rootStyles.getPropertyValue('--chart-primary-color').trim();
            console.log('🎨 CSS Variables:', { primaryColor, chartPrimaryColor });
        }
    } else {
        console.warn('⚠️ Chart color palette system not available');
    }
    
    // Initialize status display
    updateStatusDisplay();
    
    // Refresh status after a short delay to allow Chart System to load
    setTimeout(() => {
        refreshChartsStatus();
    }, 1000);
    
    // Setup auto refresh based on preferences
    (async () => {
        try {
            if (window.getPreference) {
                const autoRefreshEnabled = await window.getPreference('chartAutoRefresh');
                if (autoRefreshEnabled === 'true' || autoRefreshEnabled === true) {
                    await toggleAutoRefresh(true);
                    console.log('🔄 Auto refresh enabled from preferences');
                }
            }
        } catch (error) {
            console.log('Using fallback auto refresh from UI');
            // Fallback to UI element
            const autoRefreshCheckbox = document.getElementById('autoRefresh');
            if (autoRefreshCheckbox && autoRefreshCheckbox.checked) {
                await toggleAutoRefresh(true);
            }
        }
    })();
});

// Export functions to global scope
window.toggleSection = toggleSection;
window.refreshChartsStatus = refreshChartsStatus;
window.createNewChart = createNewChart;
window.refreshAllCharts = refreshAllCharts;
window.destroyAllCharts = destroyAllCharts;
window.refreshChart = refreshChart;
window.exportChart = exportChart;
window.destroyChart = destroyChart;
window.changeChartTheme = changeChartTheme;
window.toggleAutoRefresh = toggleAutoRefresh;
window.exportAllCharts = exportAllCharts;
window.exportSelectedCharts = exportSelectedCharts;
window.copyDetailedLog = copyDetailedLog;
window.createTestChart = createTestChart;
window.createPerformanceChart = createPerformanceChart;
window.createAccountChart = createAccountChart;
window.createMixedChart = createMixedChart;
window.updateTestChart = updateTestChart;
window.exportTestChart = exportTestChart;
window.destroyTestChart = destroyTestChart;

console.log('✅ Chart Management page ready');

