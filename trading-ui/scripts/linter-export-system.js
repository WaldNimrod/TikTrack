// ====================================================================================================
// LINTER EXPORT AND VERSIONING SYSTEM
// ====================================================================================================
// 
// מערכת ייצוא נתונים וניהול גרסאות עבור מערכת הלינטר
// מופרדת מהקובץ הראשי לשיפור ארגון הקוד

/**
 * Export chart data to JSON format
 */
async function exportChartData() {
    try {
        // Exporting chart data...
        
        if (typeof window.IndexedDBAdapter !== 'undefined') {
            const adapter = new window.IndexedDBAdapter();
            await adapter.initialize();
            
            const data = await adapter.loadAllData();
            
            if (data && data.length > 0) {
                const exportData = {
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                    dataPoints: data.length,
                    data: data
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
                
                // Chart data exported successfully
                addLogEntry('SUCCESS', 'Chart data exported successfully', { dataPoints: data.length });
            } else {
                // No data to export
                addLogEntry('INFO', 'No chart data available for export');
            }
        }
        
    } catch (error) {
        addLogEntry('ERROR', 'Failed to export chart data', { error: error.message });
    }
}

/**
 * Export comprehensive report including all system data
 */
async function exportComprehensiveReport() {
    try {
        // Exporting comprehensive report...
        
        if (typeof window.IndexedDBAdapter !== 'undefined') {
            const adapter = new window.IndexedDBAdapter();
            await adapter.initialize();
            
            const data = await adapter.loadAllData();
            
            if (data && data.length > 0) {
                const stats = calculateExportStatistics(data);
                const recommendations = generateRecommendations(stats);
                
                const report = {
                    metadata: {
                        timestamp: new Date().toISOString(),
                        version: '1.0',
                        generatedBy: 'Linter Realtime Monitor',
                        dataPoints: data.length
                    },
                    summary: stats,
                    recommendations: recommendations,
                    historicalData: data,
                    currentState: {
                        errors: scanningResults.errors.length,
                        warnings: scanningResults.warnings.length,
                        totalFiles: scanningResults.totalFiles,
                        lastScan: scanningResults.lastScan
                    }
                };
                
                const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `linter-comprehensive-report-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                // Comprehensive report exported successfully
                addLogEntry('SUCCESS', 'Comprehensive report exported successfully', { 
                    dataPoints: data.length,
                    recommendations: recommendations.length 
                });
            } else {
                // No data to export
                addLogEntry('INFO', 'No data available for comprehensive report');
            }
        }
        
    } catch (error) {
        addLogEntry('ERROR', 'Failed to export comprehensive report', { error: error.message });
    }
}

/**
 * Export data in CSV format
 */
async function exportCSVData() {
    try {
        // Exporting data in CSV format...
        
        if (typeof window.IndexedDBAdapter !== 'undefined') {
            const adapter = new window.IndexedDBAdapter();
            await adapter.initialize();
            
            const data = await adapter.loadAllData();
            
            if (data && data.length > 0) {
                const csvContent = createCSVContent(data);
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `linter-data-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                // Data exported in CSV format
                addLogEntry('SUCCESS', 'Data exported in CSV format', { rows: data.length });
            } else {
                // No data to export
                addLogEntry('INFO', 'No data available for CSV export');
            }
        }
        
    } catch (error) {
        addLogEntry('ERROR', 'Failed to export CSV data', { error: error.message });
    }
}

function calculateExportStatistics(data) {
    if (!data || data.length === 0) return {};
    
    const stats = {
        totalDataPoints: data.length,
        dateRange: {
            start: new Date(Math.min(...data.map(d => new Date(d.timestamp)))).toISOString(),
            end: new Date(Math.max(...data.map(d => new Date(d.timestamp)))).toISOString()
        },
        averages: {},
        trends: {},
        peaks: {}
    };
    
    // Calculate averages
    const metrics = ['totalFiles', 'errors', 'warnings', 'complexityScore', 'maintainabilityScore'];
    metrics.forEach(metric => {
        const values = data.map(d => d.metrics && d.metrics[metric] || 0).filter(v => v > 0);
        if (values.length > 0) {
            stats.averages[metric] = values.reduce((a, b) => a + b, 0) / values.length;
        }
    });
    
    // Calculate trends (simple: last vs first)
    if (data.length > 1) {
        const first = data[0].metrics || {};
        const last = data[data.length - 1].metrics || {};
        
        metrics.forEach(metric => {
            if (first[metric] && last[metric]) {
                const change = ((last[metric] - first[metric]) / first[metric]) * 100;
                stats.trends[metric] = {
                    change: change.toFixed(2) + '%',
                    direction: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable'
                };
            }
        });
    }
    
    return stats;
}

function createCSVContent(data) {
    const headers = [
        'Timestamp',
        'Total Files',
        'Errors',
        'Warnings',
        'Complexity Score',
        'Maintainability Score',
        'Security Score',
        'Performance Score'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(point => {
        const row = [
            point.timestamp,
            point.metrics?.totalFiles || 0,
            point.metrics?.errors || 0,
            point.metrics?.warnings || 0,
            point.metrics?.complexityScore || 0,
            point.metrics?.maintainabilityScore || 0,
            point.metrics?.securityScore || 0,
            point.metrics?.performanceScore || 0
        ];
        csvContent += row.join(',') + '\n';
    });
    
    return csvContent;
}

function generateRecommendations(stats) {
    const recommendations = [];
    
    if (stats.averages) {
        if (stats.averages.errors > 10) {
            recommendations.push({
                category: 'Quality',
                priority: 'High',
                message: `Average error count is high (${stats.averages.errors.toFixed(1)}). Focus on error reduction.`
            });
        }
        
        if (stats.averages.warnings > 50) {
            recommendations.push({
                category: 'Quality',
                priority: 'Medium',
                message: `Average warning count is high (${stats.averages.warnings.toFixed(1)}). Consider addressing warnings.`
            });
        }
        
        if (stats.averages.complexityScore < 60) {
            recommendations.push({
                category: 'Maintainability',
                priority: 'Medium',
                message: `Code complexity is concerning (${stats.averages.complexityScore.toFixed(1)}). Consider refactoring.`
            });
        }
    }
    
    if (stats.trends) {
        Object.keys(stats.trends).forEach(metric => {
            const trend = stats.trends[metric];
            if (trend.direction === 'increasing' && (metric === 'errors' || metric === 'warnings')) {
                recommendations.push({
                    category: 'Trend',
                    priority: 'High',
                    message: `${metric} are trending upward (${trend.change}). Immediate attention needed.`
                });
            }
        });
    }
    
    return recommendations;
}

/**
 * VERSION MANAGEMENT SYSTEM
 */

/**
 * Create a version snapshot of current system state
 */
async function createVersionSnapshot() {
    try {
        // Creating version snapshot...
        
        if (typeof window.IndexedDBAdapter !== 'undefined') {
            const adapter = new window.IndexedDBAdapter();
            await adapter.initialize();
            
            const data = await adapter.loadAllData();
            
            if (data && data.length > 0) {
                const versionId = generateVersionId();
                const snapshot = {
                    id: versionId,
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                    data: data,
                    statistics: {
                        dataPoints: data.length,
                        errors: scanningResults.errors.length,
                        warnings: scanningResults.warnings.length,
                        totalFiles: scanningResults.totalFiles
                    }
                };
                
                // Save to localStorage (versions are smaller, so localStorage is OK)
                const versions = JSON.parse(localStorage.getItem('linterVersions') || '[]');
                versions.push(snapshot);
                
                // Keep only last 10 versions
                if (versions.length > 10) {
                    versions.splice(0, versions.length - 10);
                }
                
                localStorage.setItem('linterVersions', JSON.stringify(versions));
                
                // Version snapshot created successfully
                addLogEntry('SUCCESS', `Version snapshot created: ${versionId}`, { 
                    versionId,
                    dataPoints: data.length 
                });
                
                updateVersionList(versionId);
                
                return versionId;
            } else {
                // No data to create version
                addLogEntry('INFO', 'No data available to create version snapshot');
            }
        }
        
    } catch (error) {
        addLogEntry('ERROR', 'Failed to create version snapshot', { error: error.message });
    }
}

/**
 * Restore system state from a version snapshot
 */
async function restoreVersionSnapshot(versionId) {
    try {
        // Restoring version
        
        const versions = JSON.parse(localStorage.getItem('linterVersions') || '[]');
        const snapshot = versions.find(v => v.id === versionId);
        
        if (snapshot && typeof window.IndexedDBAdapter !== 'undefined') {
            const adapter = new window.IndexedDBAdapter();
            await adapter.initialize();
            
            // Clear current data
            await adapter.clearAllData();
            
            // Restore snapshot data
            for (const dataPoint of snapshot.data) {
                await adapter.saveDataPoint(dataPoint);
            }
            
            // Update current state
            scanningResults.errors = new Array(snapshot.statistics.errors).fill({});
            scanningResults.warnings = new Array(snapshot.statistics.warnings).fill({});
            scanningResults.totalFiles = snapshot.statistics.totalFiles;
            
            // Version restored successfully
            addLogEntry('SUCCESS', `Version ${versionId} restored successfully`, snapshot.statistics);
            
            // Refresh UI
            await updateStatisticsDisplay();
            if (window.currentChartRenderer) {
                await window.currentChartRenderer.loadData();
            }
        } else {
            addLogEntry('ERROR', `Version ${versionId} not found`);
        }
        
    } catch (error) {
        addLogEntry('ERROR', 'Failed to restore version snapshot', { error: error.message });
    }
}

/**
 * List available version snapshots
 */
function listAvailableVersions() {
    try {
        // Available versions list...
        
        const versions = JSON.parse(localStorage.getItem('linterVersions') || '[]');
        
        // Available versions logged
        addLogEntry('INFO', `Found ${versions.length} available versions`, { 
            versions: versions.map(v => ({ id: v.id, timestamp: v.timestamp, dataPoints: v.data.length }))
        });
        
        return versions;
        
    } catch (error) {
        addLogEntry('ERROR', 'Failed to list versions', { error: error.message });
        return [];
    }
}

/**
 * Delete a version snapshot
 */
function deleteVersionSnapshot(versionId) {
    try {
        // Deleting version
        
        const versions = JSON.parse(localStorage.getItem('linterVersions') || '[]');
        const filteredVersions = versions.filter(v => v.id !== versionId);
        
        localStorage.setItem('linterVersions', JSON.stringify(filteredVersions));
        
        // Version deleted successfully
        addLogEntry('SUCCESS', `Version ${versionId} deleted successfully`);
        
        updateVersionList();
        
    } catch (error) {
        addLogEntry('ERROR', 'Failed to delete version', { error: error.message });
    }
}

function generateVersionId() {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '');
    return `v${dateStr}_${timeStr}`;
}

function updateVersionList(newVersionId = null) {
    const versions = JSON.parse(localStorage.getItem('linterVersions') || '[]');
    
    if (newVersionId) {
        // Version list updated - new version added
    } else {
        // Version list updated
    }
    
    // Update UI if version list container exists
    const versionContainer = document.getElementById('versionsList');
    if (versionContainer) {
        versionContainer.innerHTML = versions.map(version => `
            <div class="version-item">
                <span class="version-id">${version.id}</span>
                <span class="version-date">${new Date(version.timestamp).toLocaleString('he-IL')}</span>
                <span class="version-points">${version.data.length} נקודות</span>
                <button onclick="restoreVersionSnapshot('${version.id}')" class="btn btn-sm">שחזר</button>
                <button data-button-type="DELETE" data-onclick="deleteVersionSnapshot('${version.id}')"></button>
            </div>
        `).join('');
    }
}

// Export functions
if (typeof window !== 'undefined') {
    window.exportChartData = exportChartData;
    window.exportComprehensiveReport = exportComprehensiveReport;
    window.exportCSVData = exportCSVData;
    window.createVersionSnapshot = createVersionSnapshot;
    window.restoreVersionSnapshot = restoreVersionSnapshot;
    window.listAvailableVersions = listAvailableVersions;
    window.deleteVersionSnapshot = deleteVersionSnapshot;
    window.calculateExportStatistics = calculateExportStatistics;
    window.createCSVContent = createCSVContent;
    window.generateRecommendations = generateRecommendations;
    window.generateVersionId = generateVersionId;
    window.updateVersionList = updateVersionList;
}
