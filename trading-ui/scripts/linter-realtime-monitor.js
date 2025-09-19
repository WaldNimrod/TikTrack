/**
 * ========================================
 * Linter Realtime Monitor - Main Controller
 * ========================================
 * 
 * Core functionality for the Linter system:
 * - File scanning and analysis
 * - Chart management and data visualization
 * - Statistics and reporting
 * - UI control and interaction
 * 
 * Modular dependencies:
 * - linter-file-analysis.js: File content analysis functions
 * - linter-testing-system.js: Comprehensive testing and health checks
 * - linter-export-system.js: Data export and versioning
 */

// ========================================
// Global Variables and Configuration
// ========================================

// Scanning state
let scanningResults = {
    errors: [],
    warnings: [],
    totalFiles: 0,
    scannedFiles: 0,
    startTime: null,
    endTime: null
};

// Chart and data management
let chartInstance = null;
let dataCollectorInstance = null;
let chartRendererInstance = null;
let isMonitoring = false;
let autoRefreshInterval = null;
let projectFiles = [];

// UI state
let lastScanDate = null;

// ========================================
// File Discovery and Management
// ========================================

function checkAndUpdateProjectFiles() {
    const cached = localStorage.getItem('projectFiles');
    const cacheTime = localStorage.getItem('projectFilesTime');
    
    if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (age < maxAge) {
            window.projectFiles = JSON.parse(cached);
            addLogEntry('INFO', `נטענו ${window.projectFiles.length} קבצים מהמטמון`, {
                filesCount: window.projectFiles.length,
                cacheAge: Math.round(age / (60 * 60 * 1000)) + ' hours'
            });
        return;
        }
    }
    
    // Cache is old or doesn't exist - trigger auto-discovery
    autoDiscoverProjectFiles();
}

function autoDiscoverProjectFiles() {
    addLogEntry('INFO', 'מתחיל גילוי אוטומטי של קבצי הפרויקט...');
    
    // Trigger the discovery process
    if (typeof window.discoverProjectFiles === 'function') {
        window.discoverProjectFiles();
    } else {
        addLogEntry('WARNING', 'פונקציית גילוי הקבצים לא זמינה');
    }
}

window.clearProjectFilesCache = function() {
    localStorage.removeItem('projectFiles');
    localStorage.removeItem('projectFilesTime');
    addLogEntry('INFO', 'מטמון רשימת הקבצים נוקה - מתחיל גילוי מחדש...');
    autoDiscoverProjectFiles();
};

// ========================================
// Chart Management
// ========================================

function initializeChart() {
    if (typeof ChartRenderer !== 'undefined') {
        chartRendererInstance = new ChartRenderer('chartContainer');
        chartRendererInstance.initialize().then(() => {
            addLogEntry('SUCCESS', 'גרף הלינטר אותחל בהצלחה');
            loadInitialData();
        }).catch(error => {
            addLogEntry('ERROR', 'שגיאה באתחול הגרף', { error: error.message });
        });
    } else {
        addLogEntry('WARNING', 'ChartRenderer לא זמין - הגרף לא יוצג');
    }
}

async function loadInitialData() {
    try {
        if (typeof window.IndexedDBAdapter !== 'undefined') {
            const adapter = new window.IndexedDBAdapter();
            const historicalData = await adapter.getHistoricalData();
            
            if (historicalData && historicalData.length > 0) {
                addLogEntry('SUCCESS', `נטענו ${historicalData.length} נקודות נתונים היסטוריות`);
                
                if (chartRendererInstance) {
                    chartRendererInstance.updateChart(historicalData);
                }
                
                // Update statistics display with latest data
                updateStatisticsDisplay();
            } else {
                addLogEntry('INFO', 'לא נמצאו נתונים היסטוריים - מתחיל עם גרף ריק');
            }
        }
    } catch (error) {
        addLogEntry('ERROR', 'שגיאה בטעינת נתונים ראשוניים', { error: error.message });
    }
}

async function updateStatisticsDisplay() {
    try {
        if (typeof window.IndexedDBAdapter !== 'undefined') {
            const adapter = new window.IndexedDBAdapter();
            const latestData = await adapter.getLatestData();
            
            if (latestData) {
                // Update global scanning results with loaded data
                scanningResults.errors = latestData.errors || [];
                scanningResults.warnings = latestData.warnings || [];
                scanningResults.totalFiles = latestData.totalFiles || 0;
                scanningResults.scannedFiles = latestData.scannedFiles || 0;
                
                // Update last scan date display
                const lastScanElement = document.getElementById('lastScanDate');
                if (lastScanElement && latestData.timestamp) {
                    const scanDate = new Date(latestData.timestamp);
                    lastScanElement.textContent = scanDate.toLocaleString('he-IL');
                    lastScanDate = latestData.timestamp;
                } else if (lastScanElement) {
                    lastScanElement.textContent = 'טרם בוצעה';
                }
                
                // Update error and warning counts
                const errorCountElement = document.getElementById('errorCount');
                const warningCountElement = document.getElementById('warningCount');
                
                if (errorCountElement) {
                    errorCountElement.textContent = scanningResults.errors.length;
                }
                if (warningCountElement) {
                    warningCountElement.textContent = scanningResults.warnings.length;
                }
                
                addLogEntry('SUCCESS', 'סטטיסטיקות עודכנו מהנתונים השמורים');
            }
        }
    } catch (error) {
        addLogEntry('ERROR', 'שגיאה בעדכון תצוגת הסטטיסטיקות', { error: error.message });
    }
}

// ========================================
// Log Management
// ========================================

function loadLogs() {
    try {
        const logs = JSON.parse(localStorage.getItem('linterLogs') || '[]');
        logs.forEach(entry => {
            handleLogEntry(entry);
        });
        addLogEntry('SUCCESS', `נטענו ${logs.length} רשומות לוג`);
    } catch (error) {
        addLogEntry('ERROR', 'שגיאה בטעינת הלוגים', { error: error.message });
    }
}

function getAllLogEntries() {
    try {
        return JSON.parse(localStorage.getItem('linterLogs') || '[]');
    } catch (error) {
        addLogEntry('ERROR', 'שגיאה בקריאת רשומות הלוג', { error: error.message });
        return [];
    }
}

// ========================================
// Statistics and Display Management
// ========================================

function updateFileTypeStatistics(issues) {
    const stats = {};
    
    // First, add all discovered files to stats (even those without issues)
    if (window.projectFiles && window.projectFiles.length > 0) {
        window.projectFiles.forEach(file => {
            const type = getFileType(file);
            if (!stats[type]) {
                stats[type] = { files: 0, errors: 0, warnings: 0 };
            }
            stats[type].files++;
        });
    }
    
    // Then add issues to the stats
    issues.forEach(issue => {
        const type = getFileType(issue.file);
        if (!stats[type]) {
            stats[type] = { files: 0, errors: 0, warnings: 0 };
        }
        
        if (issue.type === 'error') {
            stats[type].errors++;
        } else if (issue.type === 'warning') {
            stats[type].warnings++;
        }
    });
    
    // Update UI counters
    Object.keys(stats).forEach(type => {
        const stat = stats[type];
        
        // Update file count
        const fileCountElement = document.getElementById(`${type}FileCount`);
        if (fileCountElement) {
            fileCountElement.textContent = stat.files;
        }
        
        // Update error count
        const errorCountElement = document.getElementById(`${type}ErrorCount`);
        if (errorCountElement) {
            errorCountElement.textContent = stat.errors;
        }
        
        // Update warning count
        const warningCountElement = document.getElementById(`${type}WarningCount`);
        if (warningCountElement) {
            warningCountElement.textContent = stat.warnings;
        }
    });
    
    // Update problem files table
    updateProblemFilesTable(stats);
}

function getFileType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
        case 'js':
        case 'mjs':
        case 'jsx':
            return 'js';
        case 'html':
        case 'htm':
            return 'html';
        case 'css':
        case 'scss':
        case 'sass':
        case 'less':
            return 'css';
        case 'py':
            return 'python';
        default:
            return 'other';
    }
}

function updateProblemFilesTable(stats) {
    const tableBody = document.querySelector('#problemFilesTable tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    const problemFiles = [];
    
    // Collect files with issues
    Object.keys(stats).forEach(type => {
        const stat = stats[type];
        if (stat.errors > 0 || stat.warnings > 0) {
            problemFiles.push({
                type: type,
                files: stat.files,
                errors: stat.errors,
                warnings: stat.warnings,
                total: stat.errors + stat.warnings
            });
        }
    });
    
    if (problemFiles.length === 0) {
        // Show summary of all file types even if no issues
        Object.keys(stats).forEach(type => {
            const stat = stats[type];
            if (stat.files > 0) {
                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td>${type.toUpperCase()}</td>
                    <td>${stat.files}</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td><span class="badge bg-success">תקין</span></td>
                `;
            }
        });
        
        if (Object.keys(stats).length === 0) {
            const row = tableBody.insertRow();
            row.innerHTML = `<td colspan="6" class="text-center">לא נמצאו קבצים לסריקה</td>`;
        }
    } else {
        // Sort by total issues (descending)
        problemFiles.sort((a, b) => b.total - a.total);
        
        problemFiles.forEach(file => {
            const row = tableBody.insertRow();
            const severity = file.errors > 0 ? 'danger' : 'warning';
            const severityText = file.errors > 0 ? 'קריטי' : 'אזהרה';
            
            row.innerHTML = `
                <td>${file.type.toUpperCase()}</td>
                <td>${file.files}</td>
                <td>${file.errors}</td>
                <td>${file.warnings}</td>
                <td>${file.total}</td>
                <td><span class="badge bg-${severity}">${severityText}</span></td>
            `;
        });
    }
}

// ========================================
// Scanning Functions
// ========================================

function startFileScan() {
    // Initialize statistics display at the start of scan
    updateFileTypeStatistics([]);
    
    scanningResults = {
        errors: [],
        warnings: [],
        totalFiles: 0,
        scannedFiles: 0,
        startTime: Date.now(),
        endTime: null
    };
    
    addLogEntry('INFO', 'מתחיל סריקת קבצים...');
    
    // Update UI
    const scanButton = document.getElementById('startScan');
    if (scanButton) {
        scanButton.disabled = true;
        scanButton.textContent = 'סורק...';
    }
    
    // Start scanning
    scanJavaScriptFiles();
}

function scanJavaScriptFiles() {
    const selectedTypes = getSelectedFileTypes();
    addLogEntry('INFO', `סוגי קבצים נבחרים: ${selectedTypes.join(', ')}`);
    
    let filesToScan = [];
    
    // Use discovered project files if available
    if (window.projectFiles && window.projectFiles.length > 0) {
        filesToScan = window.projectFiles.filter(file => {
            const type = getFileType(file);
            return selectedTypes.includes(type);
        });
    } else {
        // Fallback to static lists
        const staticFiles = {
            js: [
                'scripts/main.js',
                'scripts/ui-utils.js',
                'scripts/notification-system.js',
                'scripts/tables.js',
                'scripts/linter-realtime-monitor.js'
            ],
            html: [
                'linter-realtime-monitor.html',
                'index.html'
            ],
            css: [
                'styles/main-styles.css',
                'styles/header-styles.css'
            ],
            python: [
                'Backend/dev_server.py',
                'Backend/database.py'
            ],
            other: [
                'README.md',
                'package.json'
            ]
        };
        
        selectedTypes.forEach(type => {
            if (staticFiles[type]) {
                filesToScan = filesToScan.concat(staticFiles[type]);
            }
        });
    }
    
    scanningResults.totalFiles = filesToScan.length;
    addLogEntry('INFO', `נמצאו ${filesToScan.length} קבצים לסריקה`);
    
    // Scan each file
    filesToScan.forEach(fileName => {
        scanSingleFile(fileName);
    });
    
    // Finish scan
    setTimeout(() => {
        finishScan();
    }, 1000);
}

function scanSingleFile(fileName) {
    // Skip known problematic files
    const skipFiles = [
        'crud-testing-dashboard-backup.html',
        'fix-all-css.py',
        'README.md',
        'unified.css'
    ];
    
    if (skipFiles.some(skip => fileName.includes(skip))) {
        addLogEntry('INFO', `מדלג על קובץ: ${fileName} (קובץ לא נגיש או גיבוי)`);
        return;
    }
    
    const fullPath = `trading-ui/${fileName}`;
    
    fetch(fullPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.text();
        })
        .then(content => {
            const fileType = getFileType(fileName);
            
            // Use analysis functions from linter-file-analysis.js module
            if (typeof window.analyzeFileContent === 'function') {
                window.analyzeFileContent(fileName, content);
            } else {
                // Analysis module not loaded - skip file analysis
                addLogEntry('WARNING', `מודול ניתוח לא נטען - מדלג על ניתוח קובץ ${fileName}`);
                scanningResults.scannedFiles++;
            }
        })
        .catch(error => {
            if (error.message.includes('404')) {
                addLogEntry('WARNING', `קובץ לא נמצא: ${fileName} - מדלג`);
            } else {
                addLogEntry('ERROR', `שגיאה בקריאת קובץ ${fileName}`, { error: error.message });
                // No fake data - just count as scanned
                scanningResults.scannedFiles++;
            }
        });
}

// File analysis functions moved to linter-file-analysis.js module
// Functions: analyzeFileContent, analyzeHtmlContent, analyzePythonContent, analyzeCssContent, analyzeOtherContent, getLineNumber

// simulateFileAnalysis function removed - no more fake data!

async function finishScan() {
    scanningResults.endTime = Date.now();
    const duration = (scanningResults.endTime - scanningResults.startTime) / 1000;
    
    addLogEntry('SUCCESS', `סריקה הושלמה! נסרקו ${scanningResults.scannedFiles} קבצים תוך ${duration.toFixed(1)} שניות`);
    addLogEntry('INFO', `נמצאו ${scanningResults.errors.length} שגיאות ו-${scanningResults.warnings.length} אזהרות`);
    
    // Update statistics
    updateFileTypeStatistics(scanningResults.errors.concat(scanningResults.warnings));
    
    // Update UI
    const scanButton = document.getElementById('startScan');
    if (scanButton) {
        scanButton.disabled = false;
        scanButton.textContent = 'התחל סריקה';
    }
    
    // Update last scan date
    lastScanDate = new Date().toISOString();
    const lastScanElement = document.getElementById('lastScanDate');
    if (lastScanElement) {
        lastScanElement.textContent = new Date().toLocaleString('he-IL');
    }
    
    // Save data to IndexedDB
    if (typeof window.DataCollector !== 'undefined' && window.dataCollectorInstance) {
        try {
            await window.dataCollectorInstance.collectFromScan(
                getSelectedFileTypes(),
                calculateTotalSize()
            );
            addLogEntry('SUCCESS', 'נתוני הסריקה נשמרו בהצלחה');
        } catch (error) {
            addLogEntry('ERROR', 'שגיאה בשמירת נתוני הסריקה', { error: error.message });
        }
    }
    
    // Update chart
    if (chartRendererInstance) {
        try {
            const latestDataPoint = {
                timestamp: Date.now(),
                totalErrors: scanningResults.errors.length,
                totalWarnings: scanningResults.warnings.length,
                filesScanned: scanningResults.scannedFiles,
                scanDuration: duration
            };
            
            chartRendererInstance.addDataPoint(latestDataPoint);
            addLogEntry('SUCCESS', 'גרף עודכן עם נתוני הסריקה החדשים');
        } catch (error) {
            addLogEntry('ERROR', 'שגיאה בעדכון הגרף', { error: error.message });
        }
    }
}

// ========================================
// Auto-refresh and Monitoring
// ========================================

function startAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    autoRefreshInterval = setInterval(() => {
        if (isMonitoring) {
            autoUpdateChart();
        }
    }, 5 * 60 * 1000); // 5 minutes
    
    addLogEntry('INFO', 'רענון אוטומטי הופעל (כל 5 דקות)');
}

// ========================================
// UI Control Functions
// ========================================

function initializeControlButtons() {
    const startButton = document.getElementById('startScan');
    if (startButton) {
        startButton.addEventListener('click', startFileScan);
    }
    
    const monitorButton = document.getElementById('toggleMonitoring');
    if (monitorButton) {
        monitorButton.addEventListener('click', () => {
            isMonitoring = !isMonitoring;
            monitorButton.textContent = isMonitoring ? 'עצור ניטור' : 'התחל ניטור';
            
            if (isMonitoring) {
                startAutoRefresh();
                addLogEntry('SUCCESS', 'ניטור בזמן אמת הופעל');
            } else {
                if (autoRefreshInterval) {
                    clearInterval(autoRefreshInterval);
                }
                addLogEntry('INFO', 'ניטור בזמן אמת הופסק');
            }
        });
    }
}

function setupActionButtons() {
    // Additional action buttons setup
    const refreshButton = document.getElementById('refreshChart');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            if (typeof window.refreshChartData === 'function') {
                window.refreshChartData();
            }
        });
    }
    
    const clearButton = document.getElementById('clearHistory');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            if (typeof window.clearChartHistory === 'function') {
                window.clearChartHistory();
            }
        });
    }
}

// ========================================
// Session Management
// ========================================

function initializeSession() {
    addLogEntry('INFO', 'מאתחל מערכת לינטר...');
    
    // Check and update project files
    checkAndUpdateProjectFiles();
    
    // Initialize chart
    initializeChart();
    
    // Load existing logs
    loadLogs();
    
    // Initialize UI controls
    initializeControlButtons();
    setupActionButtons();
    
    // Initialize data collector
    if (typeof DataCollector !== 'undefined') {
        window.dataCollectorInstance = new DataCollector();
        addLogEntry('SUCCESS', 'אספן נתונים אותחל בהצלחה');
    }
    
    addLogEntry('SUCCESS', 'מערכת לינטר אותחלה בהצלחה');
}

// ========================================
// Logging System
// ========================================

function addLogEntry(level, message, details = {}) {
    const entry = {
        timestamp: Date.now(),
        level: level,
        message: message,
        details: details
    };
    
    // Save to localStorage
    try {
        const logs = JSON.parse(localStorage.getItem('linterLogs') || '[]');
        logs.push(entry);
        
        // Keep only last 1000 entries
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        localStorage.setItem('linterLogs', JSON.stringify(logs));
    } catch (error) {
        console.error('Error saving log entry:', error);
    }
    
    // Handle the log entry
    handleLogEntry(entry);
}

function handleLogEntry(entry) {
    // Update log display
    updateLogDisplay();
    
    // Handle different log levels
    switch (entry.level) {
        case 'ERROR':
            handleCriticalError(entry);
            break;
        case 'WARNING':
            handleWarning(entry);
            break;
        case 'SUCCESS':
            handleSuccess(entry);
            break;
    }
    
    // Monitor for patterns
    monitorPerformance(entry);
    monitorSecurity(entry);
}

// ========================================
// Error Handling and Recovery
// ========================================

function handleCriticalError(entry) {
    // Show notification
    if (typeof showNotification === 'function') {
        showNotification(entry.message, 'error', 'שגיאה קריטית');
    }
    
    // Attempt recovery based on error type
    if (entry.message.includes('chart') || entry.message.includes('גרף')) {
        attemptChartRecovery();
    } else if (entry.message.includes('storage') || entry.message.includes('שמירה')) {
        attemptStorageRecovery();
    } else if (entry.message.includes('network') || entry.message.includes('רשת')) {
        attemptNetworkRecovery();
    }
}

function handleWarning(entry) {
    if (typeof showNotification === 'function') {
        showNotification(entry.message, 'warning', 'אזהרה');
    }
}

function handleSuccess(entry) {
    if (typeof showNotification === 'function') {
        showNotification(entry.message, 'success', 'הצלחה');
    }
}

function monitorPerformance(entry) {
    if (entry.details && entry.details.scanDuration) {
        const duration = parseFloat(entry.details.scanDuration);
        if (duration > 30) { // More than 30 seconds
            addLogEntry('WARNING', `סריקה איטית זוהתה: ${duration.toFixed(1)} שניות`, {
                performance: 'slow_scan',
                duration: duration
            });
        }
    }
}

function monitorSecurity(entry) {
    const securityPatterns = [
        'eval(',
        'innerHTML =',
        'document.write',
        'setTimeout(',
        'setInterval('
    ];
    
    securityPatterns.forEach(pattern => {
        if (entry.message.includes(pattern)) {
            addLogEntry('WARNING', `זוהה דפוס אבטחה חשוד: ${pattern}`, {
                security: 'suspicious_pattern',
                pattern: pattern
            });
        }
    });
}

function attemptChartRecovery() {
    addLogEntry('INFO', 'מנסה לשחזר את הגרף...');
    
    setTimeout(() => {
        try {
            initializeChart();
            addLogEntry('SUCCESS', 'גרף שוחזר בהצלחה');
        } catch (error) {
            addLogEntry('ERROR', 'שחזור הגרף נכשל', { error: error.message });
        }
    }, 2000);
}

function attemptStorageRecovery() {
    addLogEntry('INFO', 'מנסה לשחזר את מערכת האחסון...');
    
    try {
        // Clear potentially corrupted data
        localStorage.removeItem('linterData');
        addLogEntry('SUCCESS', 'מערכת האחסון שוחזרה');
    } catch (error) {
        addLogEntry('ERROR', 'שחזור מערכת האחסון נכשל', { error: error.message });
    }
}

function attemptNetworkRecovery() {
    addLogEntry('INFO', 'בודק קישוריות רשת...');
    
    fetch('/trading-ui/linter-realtime-monitor.html')
        .then(response => {
            if (response.ok) {
                addLogEntry('SUCCESS', 'קישוריות הרשת תקינה');
            } else {
                addLogEntry('WARNING', 'בעיה בקישוריות הרשת');
            }
        })
        .catch(error => {
            addLogEntry('ERROR', 'אין קישוריות רשת', { error: error.message });
        });
}

function updateLogDisplay() {
    const logContainer = document.getElementById('logEntries');
    if (!logContainer) return;
    
    const logs = getAllLogEntries();
    const recentLogs = logs.slice(-50); // Show last 50 entries
    
    logContainer.innerHTML = recentLogs.map(entry => {
        const time = new Date(entry.timestamp).toLocaleTimeString('he-IL');
        const levelClass = entry.level.toLowerCase();
        
        return `
            <div class="log-entry log-${levelClass}">
                <span class="log-time">${time}</span>
                <span class="log-level">[${entry.level}]</span>
                <span class="log-message">${entry.message}</span>
                    </div>
                `;
    }).join('');
    
    // Scroll to bottom
    logContainer.scrollTop = logContainer.scrollHeight;
}

function copyDetailedLog() {
    const logs = getAllLogEntries();
    const logText = logs.map(entry => {
        const time = new Date(entry.timestamp).toLocaleString('he-IL');
        const details = Object.keys(entry.details).length > 0 ? 
            ` - ${JSON.stringify(entry.details)}` : '';
        return `[${time}] ${entry.level}: ${entry.message}${details}`;
    }).join('\n');
    
    navigator.clipboard.writeText(logText).then(() => {
        addLogEntry('SUCCESS', 'לוג מפורט הועתק ללוח');
    }).catch(error => {
        addLogEntry('ERROR', 'שגיאה בהעתקת הלוג', { error: error.message });
    });
}

// ========================================
// Utility Functions
// ========================================

function getSelectedFileTypes() {
    const checkboxes = document.querySelectorAll('input[name="fileType"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function calculateTotalSize() {
    // Estimate total size based on file count and average file size
    const avgFileSize = 5000; // 5KB average
    return scanningResults.scannedFiles * avgFileSize;
}

async function autoUpdateChart() {
    if (chartRendererInstance && typeof window.IndexedDBAdapter !== 'undefined') {
        try {
            const adapter = new window.IndexedDBAdapter();
            const latestData = await adapter.getHistoricalData();
            
            if (latestData && latestData.length > 0) {
                chartRendererInstance.updateChart(latestData);
                addLogEntry('INFO', 'גרף עודכן אוטומטית');
            }
        } catch (error) {
            addLogEntry('ERROR', 'שגיאה בעדכון אוטומטי של הגרף', { error: error.message });
        }
    }
}

async function updateChartIndicators(latestDataPoint) {
    if (!latestDataPoint) return;
    
    // Update indicators in the UI
    const indicators = {
        trend: latestDataPoint.totalErrors > (latestDataPoint.previousErrors || 0) ? 'עולה' : 'יורדת',
        quality: latestDataPoint.totalErrors === 0 ? 'מעולה' : latestDataPoint.totalErrors < 5 ? 'טובה' : 'דורשת שיפור',
        lastUpdate: new Date().toLocaleTimeString('he-IL')
    };
    
    // Update indicator elements
    Object.keys(indicators).forEach(key => {
        const element = document.getElementById(`indicator-${key}`);
        if (element) {
            element.textContent = indicators[key];
        }
    });
}

// ========================================
// Window Functions (Exposed globally)
// ========================================

window.refreshChartData = async function() {
    addLogEntry('INFO', 'מרענן נתוני גרף...');
    
    if (chartRendererInstance && typeof window.IndexedDBAdapter !== 'undefined') {
        try {
            const adapter = new window.IndexedDBAdapter();
            const historicalData = await adapter.getHistoricalData();
            
            chartRendererInstance.updateChart(historicalData);
            addLogEntry('SUCCESS', 'נתוני הגרף עודכנו בהצלחה');
        } catch (error) {
            addLogEntry('ERROR', 'שגיאה ברענון נתוני הגרף', { error: error.message });
        }
    }
};

window.clearChartHistory = async function() {
    if (confirm('האם אתה בטוח שברצונך לנקות את כל ההיסטוריה?')) {
        try {
            if (typeof window.IndexedDBAdapter !== 'undefined') {
                const adapter = new window.IndexedDBAdapter();
                await adapter.clearAllData();
            }
            
            if (chartRendererInstance) {
                chartRendererInstance.clearChart();
            }
            
            addLogEntry('SUCCESS', 'היסטוריית הגרף נוקתה בהצלחה');
        } catch (error) {
            addLogEntry('ERROR', 'שגיאה בניקוי היסטוריית הגרף', { error: error.message });
        }
    }
};

window.applyChartSettings = async function() {
    const settings = {
        autoRefresh: document.getElementById('autoRefresh')?.checked || false,
        refreshInterval: parseInt(document.getElementById('refreshInterval')?.value || '5'),
        showTrend: document.getElementById('showTrend')?.checked || true,
        autoClear: document.getElementById('autoClear')?.checked || false
    };
    
    // Apply auto-refresh setting
    if (settings.autoRefresh && !autoRefreshInterval) {
        startAutoRefresh();
    } else if (!settings.autoRefresh && autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
    
    // Save settings
    localStorage.setItem('chartSettings', JSON.stringify(settings));
    addLogEntry('SUCCESS', 'הגדרות הגרף נשמרו בהצלחה');
};

// ========================================
// Global Functions (Exposed to window)
// ========================================

window.startMonitoring = function() {
    isMonitoring = true;
    startAutoRefresh();
    addLogEntry('SUCCESS', 'ניטור הופעל');
};

window.copyDetailedLog = copyDetailedLog;
window.discoverProjectFiles = discoverProjectFiles;
window.startFileScan = startFileScan;
window.startMonitoring = startMonitoring;
window.stopMonitoring = stopMonitoring;
window.fixAllIssues = fixAllIssues;
window.fixAllErrors = fixAllErrors;
window.fixAllWarnings = fixAllWarnings;
window.ignoreAllIssues = ignoreAllIssues;
window.resetFixedIssues = resetFixedIssues;
window.refreshChartData = refreshChartData;
window.clearChartHistory = clearChartHistory;
window.applyChartSettings = applyChartSettings;
window.updateProblemFilesTable = updateProblemFilesTable;
window.loadIssues = loadIssues;
window.copyUnresolvedIssuesLog = copyUnresolvedIssuesLog;
window.toggleAllSections = toggleAllSections;
window.toggleSection = toggleSection;
window.runComprehensiveTests = runComprehensiveTests;
window.runQuickHealthCheck = runQuickHealthCheck;
window.exportChartData = exportChartData;
window.clearFiltersBtn = clearFiltersBtn;

// ========================================
// Initialization
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    addLogEntry('INFO', 'DOM נטען - מאתחל מערכת...');
    initializeSession();
});

// ========================================
// Project Files Discovery
// ========================================

function discoverProjectFiles() {
    addLogEntry('INFO', 'מתחיל גילוי קבצי הפרויקט...');
    
    const discoveredFiles = {
        js: [],
        html: [],
        css: [],
        python: [],
        other: []
    };
    
    // JavaScript files
    const jsFiles = [
        'trading-ui/scripts/linter-realtime-monitor.js',
        'trading-ui/scripts/linter-file-analysis.js',
        'trading-ui/scripts/linter-testing-system.js',
        'trading-ui/scripts/linter-export-system.js',
        'trading-ui/scripts/indexeddb-adapter.js',
        'trading-ui/scripts/log-recovery.js',
        'trading-ui/scripts/data-collector.js',
        'trading-ui/scripts/chart-renderer.js',
        'trading-ui/scripts/main.js',
        'trading-ui/scripts/notification-system.js',
        'trading-ui/scripts/ui-utils.js',
        'trading-ui/scripts/tables.js',
        'trading-ui/scripts/linked-items.js',
        'trading-ui/scripts/page-utils.js',
        'trading-ui/scripts/data-utils.js',
        'trading-ui/scripts/translation-utils.js',
        'trading-ui/scripts/console-cleanup.js',
        'trading-ui/scripts/date-utils.js',
        'trading-ui/scripts/color-demo-toggle.js',
        'trading-ui/scripts/color-scheme-system.js',
        'trading-ui/scripts/preferences.js',
        'trading-ui/scripts/header-system.js',
        'trading-ui/scripts/filter-system.js'
    ];
    
    // HTML files
    const htmlFiles = [
        'trading-ui/linter-realtime-monitor.html',
        'trading-ui/crud-testing-dashboard.html',
        'trading-ui/test-header-only.html',
        'trading-ui/color-scheme-examples.html',
        'trading-ui/test-header-menus-pushed.html',
        'trading-ui/test-header-yesterday.html',
        'trading-ui/index.html',
        'trading-ui/accounts.html',
        'trading-ui/executions.html',
        'trading-ui/trades.html',
        'trading-ui/preferences.html',
        'trading-ui/database.html',
        'trading-ui/background-tasks.html'
    ];
    
    // CSS files
    const cssFiles = [
        'trading-ui/styles-new/01-settings/_variables.css',
        'trading-ui/styles-new/02-tools/_mixins.css',
        'trading-ui/styles-new/03-generic/_reset.css',
        'trading-ui/styles-new/04-elements/_typography.css',
        'trading-ui/styles-new/05-objects/_layout.css',
        'trading-ui/styles-new/06-components/_buttons-advanced.css',
        'trading-ui/styles-new/06-components/_tables.css',
        'trading-ui/styles-new/07-utilities/_spacing.css',
        'trading-ui/styles-new/header-styles.css',
        'trading-ui/styles/header-styles.css',
        'trading-ui/styles/main-styles.css'
    ];
    
    // Python files
    const pythonFiles = [
        'Backend/dev_server.py',
        'Backend/db_manager.py',
        'Backend/api_handler.py',
        'Backend/background_tasks.py',
        'Backend/indexeddb_service.py',
        'Backend/data_collector.py',
        'Backend/chart_service.py',
        'Backend/linter_service.py',
        'Backend/preferences_service.py',
        'Backend/accounts_service.py',
        'Backend/executions_service.py',
        'Backend/trades_service.py',
        'Backend/database_service.py'
    ];
    
    // Other files
    const otherFiles = [
        'README.md',
        'package.json',
        'requirements.txt',
        'documentation/frontend/LINTER_SYSTEM.md',
        'documentation/frontend/CHART_IMPLEMENTATION.md',
        'documentation/frontend/INDEXEDDB_SYSTEM.md',
        'documentation/frontend/BACKGROUND_TASKS.md',
        'documentation/frontend/TESTING_SYSTEM.md',
        'documentation/frontend/EXPORT_SYSTEM.md'
    ];
    
    // Combine all files
    discoveredFiles.js = jsFiles;
    discoveredFiles.html = htmlFiles;
    discoveredFiles.css = cssFiles;
    discoveredFiles.python = pythonFiles;
    discoveredFiles.other = otherFiles;
    
    // Store in global variable
    window.projectFiles = discoveredFiles;
    
    // Cache the discovery
    localStorage.setItem('linterProjectFiles', JSON.stringify(discoveredFiles));
    localStorage.setItem('linterProjectFilesTimestamp', Date.now().toString());
    
    const totalFiles = jsFiles.length + htmlFiles.length + cssFiles.length + pythonFiles.length + otherFiles.length;
    addLogEntry('SUCCESS', `גילוי הושלם - נמצאו ${totalFiles} קבצים (JS: ${jsFiles.length}, HTML: ${htmlFiles.length}, CSS: ${cssFiles.length}, Python: ${pythonFiles.length}, Other: ${otherFiles.length})`);
    
    return discoveredFiles;
}

// ========================================
// Module References
// ========================================

// Testing system functions moved to linter-testing-system.js module
// Functions: runComprehensiveTests, testSystemComponents, testPerformance, testSecurity, testFunctionality, testDataIntegrity, generateTestRecommendations, saveTestResults, displayTestResults, updateTestResultsDisplay, runQuickHealthCheck, updateHealthCheckDisplay

// Export system functions moved to linter-export-system.js module  
// Functions: exportChartData, exportComprehensiveReport, exportCSVData, createVersionSnapshot, restoreVersionSnapshot, listAvailableVersions, deleteVersionSnapshot, calculateExportStatistics, createCSVContent, generateRecommendations, generateVersionId, updateVersionList
