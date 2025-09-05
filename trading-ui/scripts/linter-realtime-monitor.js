/**
 * Linter Realtime Monitor Script
 * סקריפט ניטור Linter בזמן אמת
 */

// Global variables
let qualityChart;
let autoRefreshInterval;
let isAutoRefreshActive = true;
let currentFilter = 'all';

// Initialize the linter monitor system
document.addEventListener("DOMContentLoaded", () => {
    console.log('🚀 טעינת דף ניטור Linter בזמן אמת...');

    // Initialize HeaderSystem
    if (window.headerSystem && !window.headerSystem.isInitialized) {
        console.log('✅ אתחול HeaderSystem...');
        window.headerSystem.init();
    }

    // Check notification system availability
    if (typeof window.showSuccessNotification === 'function') {
        console.log('✅ מערכת התראות זמינה');
    } else {
        console.log('⚠️ מערכת התראות לא זמינה');
    }

    // Initialize components
    initializeChart();
    loadInitialData();
    startAutoRefresh();
    
    // Initialize control buttons
    initializeControlButtons();
});

function initializeChart() {
    const canvas = document.getElementById('linterChart');
    if (!canvas) {
        console.error('❌ Canvas element with ID "linterChart" not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    qualityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'איכות קוד (%)',
                data: [],
                borderColor: '#29a6a8',
                backgroundColor: 'rgba(41, 166, 168, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#29a6a8',
                pointBorderColor: '#1f8a8c',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `איכות קוד: ${context.parsed.y}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'זמן'
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'אחוז איכות'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
    
    // Add initial data points to make the chart more interesting
    setTimeout(() => {
        // Add some historical data points
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const time = new Date(now.getTime() - (i * 60000)); // 1 minute intervals
            const timeLabel = time.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
            const quality = 89 + Math.random() * 10 - 5; // Random quality between 84-94
            
            qualityChart.data.labels.push(timeLabel);
            qualityChart.data.datasets[0].data.push(Math.round(quality));
        }
        qualityChart.update('none');
    }, 500);
}

function loadInitialData() {
    // Real data simulation based on actual project structure
    const mockData = {
        totalFiles: 156,
        totalErrors: 7,
        totalWarnings: 23,
        codeQuality: 89
    };

    updateStats(mockData);
    updateChart(mockData);
    loadIssues();
    
    // Update summary stats
    updateSummaryStats(mockData);
}

function updateStats(data) {
    // Update stat cards
    const errorCount = document.getElementById('errorCount');
    const warningCount = document.getElementById('warningCount');
    const successCount = document.getElementById('successCount');
    const filesScanned = document.getElementById('filesScanned');

    if (errorCount) errorCount.textContent = data.totalErrors;
    if (warningCount) warningCount.textContent = data.totalWarnings;
    if (successCount) successCount.textContent = data.totalFiles - data.totalErrors - data.totalWarnings;
    if (filesScanned) filesScanned.textContent = data.totalFiles;

    // Update changes (simulation)
    const errorChange = document.getElementById('errorChange');
    const warningChange = document.getElementById('warningChange');
    const successChange = document.getElementById('successChange');
    const filesChange = document.getElementById('filesChange');

    if (errorChange) errorChange.textContent = `${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 3)}`;
    if (warningChange) warningChange.textContent = `${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 5)}`;
    if (successChange) successChange.textContent = `+${Math.floor(Math.random() * 5)}`;
    if (filesChange) filesChange.textContent = `+${Math.floor(Math.random() * 3)}`;
    
    // Update statistics count
    updateStatisticsCount();
    
    // Update chart with new data
    updateChart();
}

function updateChart(data) {
    if (!qualityChart) return;
    
    // If no data provided, use current stats to calculate code quality
    if (!data) {
        const errorCount = parseInt(document.getElementById('errorCount')?.textContent || '0');
        const warningCount = parseInt(document.getElementById('warningCount')?.textContent || '0');
        const filesScanned = parseInt(document.getElementById('filesScanned')?.textContent || '1');
        
        // Calculate code quality percentage (100% - (errors + warnings) / files * 100)
        const totalIssues = errorCount + warningCount;
        const codeQuality = Math.max(0, 100 - (totalIssues / filesScanned * 100));
        
        data = { codeQuality: Math.round(codeQuality) };
    }
    
    const now = new Date();
    const timeLabel = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    
    qualityChart.data.labels.push(timeLabel);
    qualityChart.data.datasets[0].data.push(data.codeQuality);
    
    // Keep only last 20 points
    if (qualityChart.data.labels.length > 20) {
        qualityChart.data.labels.shift();
        qualityChart.data.datasets[0].data.shift();
    }
    
    qualityChart.update('none');
}

function loadIssues() {
    const mockIssues = [
        {
            severity: 'error',
            message: 'Missing semicolon',
            file: 'trading-ui/scripts/main.js',
            line: 45,
            rule: 'semi'
        },
        {
            severity: 'error',
            message: 'Undefined variable',
            file: 'trading-ui/scripts/linter-realtime-monitor.js',
            line: 12,
            rule: 'no-undef'
        },
        {
            severity: 'warning',
            message: 'Unused variable',
            file: 'Backend/routes/api/trades.py',
            line: 23,
            rule: 'unused-variable'
        },
        {
            severity: 'warning',
            message: 'Long line detected',
            file: 'trading-ui/styles/styles.css',
            line: 234,
            rule: 'max-len'
        },
        {
            severity: 'info',
            message: 'Consider using const instead of let',
            file: 'trading-ui/scripts/header-system.js',
            line: 156,
            rule: 'prefer-const'
        },
        {
            severity: 'info',
            message: 'Missing JSDoc comment',
            file: 'trading-ui/scripts/notification-system.js',
            line: 89,
            rule: 'require-jsdoc'
        }
    ];

    displayIssues(mockIssues);
    updateLogsCount(mockIssues.length);
}

function displayIssues(issues) {
    const logsContainer = document.getElementById('logsContainer');
    if (!logsContainer) return;
    
    if (issues.length === 0) {
        logsContainer.innerHTML = `
            <div class="log-entry">
                <span class="log-timestamp">[${new Date().toLocaleTimeString('he-IL')}]</span>
                <span class="log-level success">[SUCCESS]</span>
                <span class="log-message">🎉 אין בעיות נוכחיות!</span>
            </div>
        `;
        return;
    }

    const filteredIssues = currentFilter === 'all' ? issues : issues.filter(issue => issue.severity === currentFilter);
    
    logsContainer.innerHTML = filteredIssues.map(issue => `
        <div class="log-entry">
            <span class="log-timestamp">[${new Date().toLocaleTimeString('he-IL')}]</span>
            <span class="log-level ${issue.severity}">[${issue.severity.toUpperCase()}]</span>
            <span class="log-message">${issue.message} - ${issue.file}:${issue.line}</span>
        </div>
    `).join('');
}

function filterIssues(filter) {
    currentFilter = filter;
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Reload issues
    loadIssues();
}

function fixIssue(file, line) {
    if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('תיקון אוטומטי', `תיקון אוטומטי עבור ${file}:${line}`);
    } else {
        alert(`תיקון אוטומטי עבור ${file}:${line}`);
    }
}

function ignoreIssue(file, line) {
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('התעלמות מבעיה', `התעלמות מבעיה ב-${file}:${line}`);
    } else {
        alert(`התעלמות מבעיה ב-${file}:${line}`);
    }
}

function toggleAutoRefresh() {
    isAutoRefreshActive = !isAutoRefreshActive;
    const toggle = document.querySelector('.refresh-toggle');
    const status = document.getElementById('refreshStatus');
    
    if (isAutoRefreshActive) {
        toggle.classList.add('active');
        if (status) status.textContent = 'פעיל';
        startAutoRefresh();
    } else {
        toggle.classList.remove('active');
        if (status) status.textContent = 'לא פעיל';
        stopAutoRefresh();
    }
}

function startAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    autoRefreshInterval = setInterval(() => {
        if (isAutoRefreshActive) {
            // Simulate real-time data changes
            simulateDataChanges();
            updateChart(); // Update chart with current data
        }
    }, 10000); // Update every 10 seconds for better demo
}

function simulateDataChanges() {
    // Simulate small changes in the data
    const errorCount = document.getElementById('errorCount');
    const warningCount = document.getElementById('warningCount');
    const filesScanned = document.getElementById('filesScanned');
    
    if (errorCount && Math.random() > 0.7) {
        const current = parseInt(errorCount.textContent);
        const change = Math.random() > 0.5 ? 1 : -1;
        const newValue = Math.max(0, current + change);
        errorCount.textContent = newValue;
    }
    
    if (warningCount && Math.random() > 0.6) {
        const current = parseInt(warningCount.textContent);
        const change = Math.random() > 0.4 ? 1 : -1;
        const newValue = Math.max(0, current + change);
        warningCount.textContent = newValue;
    }
    
    // Update statistics count
    updateStatisticsCount();
    
    // Update chart with new data
    updateChart();
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

// Copy detailed log function
function copyDetailedLog() {
    try {
        let detailedLog = `=== ניטור Linter בזמן אמת - לוג מפורט ===\n`;
        detailedLog += `תאריך ושעה: ${new Date().toLocaleString('he-IL')}\n\n`;
        
        // Statistics
        const errorCount = document.getElementById('errorCount')?.textContent || '0';
        const warningCount = document.getElementById('warningCount')?.textContent || '0';
        const successCount = document.getElementById('successCount')?.textContent || '0';
        const filesScanned = document.getElementById('filesScanned')?.textContent || '0';
        
        detailedLog += `=== סטטיסטיקות ===\n`;
        detailedLog += `שגיאות: ${errorCount}\n`;
        detailedLog += `אזהרות: ${warningCount}\n`;
        detailedLog += `הצלחות: ${successCount}\n`;
        detailedLog += `קבצים נסרקו: ${filesScanned}\n\n`;

        // Monitor status
        const monitorStatus = document.getElementById('monitorStatus')?.textContent || 'לא ידוע';
        
        detailedLog += `=== מצב הניטור ===\n`;
        detailedLog += `סטטוס ניטור: ${monitorStatus}\n`;
        detailedLog += `עדכון אוטומטי: ${isAutoRefreshActive ? 'פעיל' : 'לא פעיל'}\n\n`;

        detailedLog += `=== סיום לוג ===`;

        // Copy to clipboard
        navigator.clipboard.writeText(detailedLog).then(() => {
            if (window.showSuccessNotification) {
                window.showSuccessNotification('העתקת לוג', 'לוג מפורט הועתק ללוח בהצלחה');
            }
        }).catch(err => {
            console.error('שגיאה בהעתקת לוג:', err);
        });
    } catch (error) {
        console.error('שגיאה ביצירת לוג מפורט:', error);
    }
}

// Additional functions for the updated HTML structure
function toggleSection(sectionId) {
    if (typeof window.toggleSectionGlobal === 'function') {
        window.toggleSectionGlobal(sectionId);
    } else {
        console.warn('פונקציית toggleSectionGlobal לא נמצאה ב-main.js');
    }
}

function resetSettings() {
    // Reset all settings to default values
    document.getElementById('scanInterval').value = 5;
    document.getElementById('logLevel').value = 'warning';
    document.getElementById('scanPaths').value = 'trading-ui/';
    
    if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('איפוס הגדרות', 'הגדרות ניטור אופסו לברירת מחדל');
    }
}

function updateSummaryStats(data) {
    // Update the summary statistics in the top section
    const totalFilesStats = document.getElementById('totalFilesStats');
    const totalErrorsStats = document.getElementById('totalErrorsStats');
    const totalWarningsStats = document.getElementById('totalWarningsStats');
    const overallStatus = document.getElementById('overallStatus');
    
    if (totalFilesStats) totalFilesStats.textContent = data.totalFiles;
    if (totalErrorsStats) totalErrorsStats.textContent = data.totalErrors;
    if (totalWarningsStats) totalWarningsStats.textContent = data.totalWarnings;
    
    // Determine overall status
    let status = 'מעולה';
    let statusClass = 'success';
    if (data.totalErrors > 5) {
        status = 'דורש תשומת לב';
        statusClass = 'warning';
    }
    if (data.totalErrors > 10) {
        status = 'בעיות חמורות';
        statusClass = 'danger';
    }
    
    if (overallStatus) {
        overallStatus.textContent = status;
        overallStatus.className = statusClass;
    }
}

function updateLogsCount(count) {
    const logsCount = document.getElementById('logsCount');
    if (logsCount) {
        logsCount.textContent = `${count} רשומות`;
    }
}

function updateStatisticsCount() {
    const statisticsCount = document.getElementById('statisticsCount');
    if (statisticsCount) {
        const errorCount = document.getElementById('errorCount')?.textContent || '0';
        const warningCount = document.getElementById('warningCount')?.textContent || '0';
        const successCount = document.getElementById('successCount')?.textContent || '0';
        const filesScanned = document.getElementById('filesScanned')?.textContent || '0';
        
        statisticsCount.textContent = `${filesScanned} קבצים, ${errorCount} שגיאות, ${warningCount} אזהרות`;
    }
}

// Global functions for button onclick handlers
window.toggleTopSection = function() {
    if (typeof window.toggleTopSectionGlobal === 'function') {
        window.toggleTopSectionGlobal();
    } else {
        console.warn('פונקציית toggleTopSectionGlobal לא נמצאה ב-main.js');
    }
};

function initializeControlButtons() {
    // Initialize start/stop monitoring buttons
    const startBtn = document.getElementById('startMonitoring');
    const stopBtn = document.getElementById('stopMonitoring');
    const clearBtn = document.getElementById('clearLogs');
    const exportBtn = document.getElementById('exportLogs');
    
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            startBtn.disabled = true;
            if (stopBtn) stopBtn.disabled = false;
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('ניטור', 'ניטור Linter הופעל');
            }
        });
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            stopBtn.disabled = true;
            if (startBtn) startBtn.disabled = false;
            if (typeof window.showInfoNotification === 'function') {
                window.showInfoNotification('ניטור', 'ניטור Linter הופסק');
            }
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const logsContainer = document.getElementById('logsContainer');
            if (logsContainer) {
                logsContainer.innerHTML = `
                    <div class="log-entry">
                        <span class="log-timestamp">[${new Date().toLocaleTimeString('he-IL')}]</span>
                        <span class="log-level info">[INFO]</span>
                        <span class="log-message">לוגים נוקו</span>
                    </div>
                `;
                updateLogsCount(1);
            }
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('ניקוי', 'לוגים נוקו בהצלחה');
            }
        });
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            copyDetailedLog();
        });
    }
}

window.toggleSection = toggleSection;
window.resetSettings = resetSettings;
window.copyDetailedLog = copyDetailedLog;

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
});
