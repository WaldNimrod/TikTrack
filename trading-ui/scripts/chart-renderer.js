/**
 * ========================================
 * Chart Renderer Module - Linter Realtime Monitor
 * ========================================
 * 
 * מודול גרפים למערכת ניטור Linter
 * כולל ניהול גרפי איכות וספירות
 * 
 * תכונות:
 * - אתחול גרפים
 * - עדכון גרפים בזמן אמת
 * - ניהול נתוני גרפים
 * - שחזור גרפים
 * - ייצוא נתוני גרפים
 * 
 * ========================================
 * 
 * מחבר: TikTrack Development Team
 * תאריך עדכון אחרון: 2025
 * ========================================
 */

// Global chart renderer instances
window.qualityChartRenderer = null;
window.countsChartRenderer = null;

/**
 * אתחול גרפים
 * Initialize charts
 */
function initializeCharts() {
    if (typeof QualityChartRenderer === 'undefined' || typeof CountsChartRenderer === 'undefined') {
        addLogEntry('WARNING', 'ChartRenderers לא זמינים - הגרפים לא יוצגו');
        console.warn('ChartRenderers are not available');
        return;
    }

    // Initialize Quality Chart (percentages) - only if not already initialized
    if (!window.qualityChartRenderer) {
        window.qualityChartRenderer = new QualityChartRenderer('qualityChartContainer');
        window.qualityChartRenderer.initialize().then(() => {
            console.log('✅ Quality chart initialized');
        }).catch(error => {
            addLogEntry('ERROR', 'שגיאה באתחול גרף איכות', { error: error.message });
            console.error('Quality chart initialization error:', error);
        });
    } else {
        console.log('✅ Quality chart already initialized');
    }

    // Initialize Counts Chart (numbers) - only if not already initialized
    if (!window.countsChartRenderer) {
        window.countsChartRenderer = new CountsChartRenderer('countsChartContainer');
        window.countsChartRenderer.initialize().then(() => {
            console.log('✅ Counts chart initialized');
            loadInitialData();
        }).catch(error => {
            addLogEntry('ERROR', 'שגיאה באתחול גרף ספירות', { error: error.message });
            console.error('Counts chart initialization error:', error);
        });
    } else {
        console.log('✅ Counts chart already initialized');
    }
}

/**
 * עדכון גרף איכות
 * Update quality chart
 */
function updateQualityChart(data) {
    console.log('🔍 updateQualityChart called with data:', data);
    
    if (window.qualityChartRenderer && window.qualityChartRenderer.isInitialized) {
        console.log('🔍 Calling qualityChartRenderer.updateChart');
        window.qualityChartRenderer.updateChart(data);
    } else {
        console.log('⚠️ Quality chart renderer not ready');
    }
}

/**
 * עדכון גרף ספירות
 * Update counts chart
 */
function updateCountsChart(data) {
    console.log('🔍 updateCountsChart called with data:', data);
    
    if (window.countsChartRenderer && window.countsChartRenderer.isInitialized) {
        console.log('🔍 Calling countsChartRenderer.updateChart');
        window.countsChartRenderer.updateChart(data);
    } else {
        console.log('⚠️ Counts chart renderer not ready');
    }
}

/**
 * הוספת נקודת נתונים לגרפים
 * Add data point to charts
 */
function addDataPointToCharts(dataPoint) {
    updateQualityChart(dataPoint);
    updateCountsChart(dataPoint);
}

/**
 * ניקוי גרפים
 * Clear charts
 */
function clearCharts() {
    if (window.qualityChartRenderer) {
        window.qualityChartRenderer.clearChart();
    }
    if (window.countsChartRenderer) {
        window.countsChartRenderer.clearChart();
    }
}

/**
 * עדכון אינדיקטורים של גרפים
 * Update chart indicators
 */
function updateChartIndicators() {
    console.log('🔍 updateChartIndicators called');
    
    // Get latest data from IndexedDB
    if (typeof window.linterIndexedDBAdapter !== 'undefined' && window.linterIndexedDBAdapter) {
        window.linterIndexedDBAdapter.getLatestData().then(latestData => {
            console.log('🔍 IndexedDB latest data:', latestData);
            
            if (latestData && latestData.length > 0) {
                const latestDataPoint = latestData[latestData.length - 1];
                updateChartTrendIndicators(latestDataPoint);
            } else {
                console.log('📊 No data found in IndexedDB');
            }
        }).catch(error => {
            console.error('Error getting latest data from IndexedDB:', error);
        });
    } else {
        console.log('⚠️ IndexedDB adapter not available');
    }
}

/**
 * עדכון אינדיקטורי מגמה של גרפים
 * Update chart trend indicators
 */
async function updateChartTrendIndicators(latestDataPoint) {
    console.log('📊 Updating chart trend indicators with:', latestDataPoint);
    
    try {
        if (latestDataPoint) {
            console.log('📊 Trend indicators updated');
        }
    } catch (error) {
        console.error('❌ Update trend indicators failed:', error);
    }
}

/**
 * רענון נתוני גרפים
 * Refresh chart data
 */
window.refreshChartData = async function() {
    console.log('🔄 Refreshing chart data...');
    
    try {
        clearCharts();
        
        if (typeof loadInitialData === 'function') {
            await loadInitialData();
        }
        
        updateChartIndicators();
        
        if (typeof showNotification === 'function') {
            showNotification('נתוני גרפים רוענו בהצלחה', 'success');
        }
        
        console.log('✅ Chart data refreshed');
    } catch (error) {
        console.error('❌ Refresh chart data failed:', error);
        if (typeof showNotification === 'function') {
            showNotification('שגיאה ברענון נתוני גרפים', 'error');
        }
    }
};

/**
 * ניקוי היסטוריית גרפים
 * Clear chart history
 */
window.clearChartHistory = async function() {
    console.log('🗑️ Clearing chart history...');
    
    try {
        if (typeof window.linterIndexedDBAdapter !== 'undefined' && window.linterIndexedDBAdapter) {
            await window.linterIndexedDBAdapter.clearChartHistory();
        }
        
        clearCharts();
        
        if (typeof showNotification === 'function') {
            showNotification('היסטוריית גרפים נוקתה', 'success');
        }
        
        console.log('✅ Chart history cleared');
    } catch (error) {
        console.error('❌ Clear chart history failed:', error);
        if (typeof showNotification === 'function') {
            showNotification('שגיאה בניקוי היסטוריית גרפים', 'error');
        }
    }
};

/**
 * ייצוא נתוני גרפים
 * Export chart data
 */
function exportChartData() {
    console.log('📤 Exporting chart data...');
    
    try {
        if (typeof window.linterIndexedDBAdapter !== 'undefined' && window.linterIndexedDBAdapter) {
            window.linterIndexedDBAdapter.getLatestData().then(data => {
                if (data && data.length > 0) {
                    const exportData = {
                        timestamp: new Date().toISOString(),
                        data: data,
                        metadata: {
                            totalRecords: data.length,
                            exportVersion: '1.0'
                        }
                    };
                    
                    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `linter-chart-data-${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    if (typeof showNotification === 'function') {
                        showNotification('נתוני גרפים יוצאו בהצלחה', 'success');
                    }
                    
                    console.log('✅ Chart data exported');
                } else {
                    if (typeof showNotification === 'function') {
                        showNotification('אין נתונים לייצוא', 'warning');
                    }
                }
            }).catch(error => {
                console.error('❌ Export chart data failed:', error);
                if (typeof showNotification === 'function') {
                    showNotification('שגיאה בייצוא נתוני גרפים', 'error');
                }
            });
        } else {
            if (typeof showNotification === 'function') {
                showNotification('מערכת נתונים לא זמינה', 'error');
            }
        }
    } catch (error) {
        console.error('❌ Export chart data failed:', error);
        if (typeof showNotification === 'function') {
            showNotification('שגיאה בייצוא נתוני גרפים', 'error');
        }
    }
}

// Export functions to global scope
window.initializeCharts = initializeCharts;
window.updateQualityChart = updateQualityChart;
window.updateCountsChart = updateCountsChart;
window.addDataPointToCharts = addDataPointToCharts;
window.clearCharts = clearCharts;
window.updateChartIndicators = updateChartIndicators;
window.updateChartTrendIndicators = updateChartTrendIndicators;
window.exportChartData = exportChartData;

console.log('📊 Chart Renderer Module loaded successfully');