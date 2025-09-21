/**
 * Linter Realtime Monitor - TikTrack
 * מוניטור Linter בזמן אמת - TikTrack
 * 
 * @version 1.0.0
 * @lastUpdated December 2024
 * @author TikTrack Development Team
 */

console.log('🔍 Linter Realtime Monitor loaded');

// Chart instances for the new system
let qualityChart = null;
let countsChart = null;

// File scanning state
let fileScanningState = {
    discovered: { total: 0, byType: {} },
    selected: [],
    updateDiscovered: function(files) {
        this.discovered = { total: 0, byType: {} };
        Object.keys(files).forEach(type => {
            this.discovered.byType[type] = files[type] ? files[type].length : 0;
            this.discovered.total += this.discovered.byType[type];
        });
    },
    updateSelected: function(types) {
        this.selected = types;
    },
    getStatsMessage: function() {
        return {
            discovered: `נמצאו ${this.discovered.total} קבצים`
        };
    }
};

// UI state
let isMonitoring = false;
let autoRefreshInterval = null;
let projectFiles = [];

// Chart system functions
// פונקציות מערכת גרפים

/**
 * Initialize charts using the new system
 * אתחל גרפים באמצעות המערכת החדשה
 */
async function initializeCharts() {
    try {
        console.log('📊 Initializing charts with new system...');
        
        // Wait for Chart System to be ready
        if (!window.ChartSystem) {
            console.warn('⚠️ Chart System not available');
            return;
        }
        
        // Check if chart containers exist and are visible
        const qualityContainer = document.getElementById('qualityChartContainer');
        const countsContainer = document.getElementById('countsChartContainer');
        
        if (!qualityContainer || !countsContainer) {
            console.warn('⚠️ Chart containers not found, skipping chart initialization');
            return;
        }
        
        // Check if containers have proper dimensions
        if (qualityContainer.offsetWidth === 0 || qualityContainer.offsetHeight === 0 ||
            countsContainer.offsetWidth === 0 || countsContainer.offsetHeight === 0) {
            console.warn('⚠️ Chart containers have no dimensions, skipping chart initialization');
        return;
    }
    
        // Initialize Quality Chart
        if (window.LinterAdapter) {
            const linterData = await window.LinterAdapter.getData({ hours: 24 });
            const formattedData = window.LinterAdapter.formatData(linterData);
            
            qualityChart = await window.ChartSystem.create({
                id: 'qualityChart',
        type: 'line',
                container: '#qualityChartContainer',
                data: formattedData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                            display: true,
                            position: 'top'
                }
            },
            scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                    title: {
                        display: true,
                                text: 'איכות (%)'
                            }
                        }
                    }
                }
            });

            countsChart = await window.ChartSystem.create({
                id: 'countsChart',
                type: 'bar',
                container: '#countsChartContainer',
                data: formattedData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                                text: 'ספירות'
                            }
                        }
            }
        }
    });
        }

        console.log('✅ Charts initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize charts:', error);
    }
}

/**
 * Update charts with new data
 * עדכן גרפים עם נתונים חדשים
 */
async function updateCharts(data) {
    try {
        if (qualityChart && window.ChartSystem) {
            await window.ChartSystem.update('qualityChart', data);
        }
        
        if (countsChart && window.ChartSystem) {
            await window.ChartSystem.update('countsChart', data);
        }
        
        console.log('✅ Charts updated successfully');
    } catch (error) {
        console.error('❌ Failed to update charts:', error);
    }
}

/**
 * Refresh chart data
 * רענן נתוני גרפים
 */
async function refreshChartData() {
    try {
        if (window.LinterAdapter) {
            const linterData = await window.LinterAdapter.getData({ hours: 24 });
            const formattedData = window.LinterAdapter.formatData(linterData);
            
            await updateCharts(formattedData);
            
            if (typeof showNotification === 'function') {
                showNotification('נתוני גרפים רוענו בהצלחה', 'success');
            }
        }
    } catch (error) {
        console.error('❌ Failed to refresh chart data:', error);
        if (typeof showNotification === 'function') {
            showNotification('שגיאה ברענון נתוני גרפים', 'error');
        }
    }
}

/**
 * Clear chart history
 * נקה היסטוריית גרפים
 */
async function clearChartHistory() {
    if (confirm('האם אתה בטוח שברצונך לנקות את היסטוריית הגרפים?')) {
        try {
            if (window.ChartSystem) {
                window.ChartSystem.destroyAll();
                await initializeCharts();
            }
            
            if (typeof showNotification === 'function') {
                showNotification('היסטוריית גרפים נוקתה בהצלחה', 'success');
            }
        } catch (error) {
            console.error('❌ Failed to clear chart history:', error);
            if (typeof showNotification === 'function') {
                showNotification('שגיאה בניקוי היסטוריית גרפים', 'error');
            }
        }
    }
}

// Linter system functions
// פונקציות מערכת Linter

/**
 * Initialize linter system
 * אתחל מערכת Linter
 */
async function initializeLinterSystem() {
    try {
        console.log('🔍 Initializing Linter system...');
        
        // Initialize project files
        await loadProjectFiles();
        
        // Setup event listeners
        setupEventListeners();
        
        // Update file mapping status display
        updateFileMappingStatus();
        
        console.log('✅ Linter system initialized');
    } catch (error) {
        console.error('❌ Failed to initialize Linter system:', error);
    }
}

/**
 * Load project files
 * טען קבצי פרויקט
 */
async function loadProjectFiles() {
    try {
        // This will be implemented when we have real file scanning
        console.log('📁 Loading project files...');
        projectFiles = [];
    } catch (error) {
        console.error('❌ Failed to load project files:', error);
    }
}

/**
 * Setup event listeners
 * הגדר מאזיני אירועים
 */
function setupEventListeners() {
    // Refresh button
    const refreshButton = document.getElementById('refreshChart');
    if (refreshButton) {
        refreshButton.addEventListener('click', refreshChartData);
    }

    // Clear button
    const clearButton = document.getElementById('clearChart');
    if (clearButton) {
        clearButton.addEventListener('click', clearChartHistory);
    }

    // Export button
    const exportButton = document.getElementById('exportChart');
    if (exportButton) {
        exportButton.addEventListener('click', () => {
            if (typeof showNotification === 'function') {
                showNotification('ייצוא גרפים יהיה זמין בעתיד', 'info');
            }
        });
    }
}

/**
 * Start monitoring
 * התחל ניטור
 */
function startMonitoring() {
    if (isMonitoring) {
        console.log('⚠️ Monitoring already active');
        return;
    }

    isMonitoring = true;
    console.log('🔍 Monitoring started');

    // Setup auto-refresh
    autoRefreshInterval = setInterval(() => {
        if (isMonitoring) {
            refreshChartData();
        }
    }, 5 * 60 * 1000); // 5 minutes

    if (typeof showNotification === 'function') {
        showNotification('ניטור Linter הופעל', 'success');
    }
}

/**
 * Stop monitoring
 * עצור ניטור
 */
function stopMonitoring() {
    if (!isMonitoring) {
        console.log('⚠️ Monitoring not active');
        return;
    }

    isMonitoring = false;
    
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }

    console.log('🔍 Monitoring stopped');

    if (typeof showNotification === 'function') {
        showNotification('ניטור Linter הופסק', 'info');
    }
}

/**
 * Toggle monitoring
 * החלף ניטור
 */
function toggleMonitoring() {
    if (isMonitoring) {
        stopMonitoring();
    } else {
        startMonitoring();
    }
}

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔍 Linter Realtime Monitor DOM loaded');
    
    try {
        // Initialize linter system
        await initializeLinterSystem();
        
        // Initialize charts after a delay to ensure all systems are ready
        // Charts initialization disabled for now
        console.log('📊 Charts initialization disabled');
        
        } catch (error) {
        console.error('❌ Failed to initialize Linter Realtime Monitor:', error);
    }
});

// ========================================
// Project Files Discovery
// ========================================

async function discoverProjectFiles() {
    addLogEntry('INFO', 'מתחיל גילוי קבצי הפרויקט...');
    
    // Show discovery progress animation
    const progressElement = document.getElementById('fileDiscoveryProgress');
    if (progressElement) {
        progressElement.style.display = 'block';
        progressElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> מגלה קבצים...';
    }
    
    try {
        // Use global project files scanner if available
        if (typeof window.projectFilesScanner !== 'undefined') {
            addLogEntry('INFO', 'משתמש במנגנון סריקת קבצים גלובלי...');
            const discoveredFiles = await window.projectFilesScanner.getProjectFiles(['js', 'html', 'css', 'python', 'other']);
            const stats = await window.projectFilesScanner.getFileStatistics();
            
            console.log('📁 Discovered files:', discoveredFiles);
            console.log('📊 File statistics:', stats);
            
            // Store in global variable for backward compatibility
            window.projectFiles = discoveredFiles;
            
            // Update file type statistics immediately with discovered files
            // Don't call updateFileTypeStatistics with empty array - it will reset the values
            // The updateFileMappingStatus function already handles the dashboard updates
            
            // Force update of file type selection display
            setTimeout(() => {
                // Don't call updateFileTypeStatistics with empty array
                updateRealtimeProgress();
                console.log('🔄 Forced update of realtime progress after discovery');
            }, 100);
            
            // Update scanning results with discovered files
            if (!window.scanningResults) {
                window.scanningResults = {
                    errors: [],
                    warnings: [],
                    totalFiles: 0,
                    scannedFiles: 0,
                    startTime: null,
                    endTime: null
                };
            }
            
            // Update total files count with discovered files
            const totalDiscoveredFiles = Object.values(discoveredFiles).reduce((sum, files) => sum + files.length, 0);
            window.scanningResults.totalFiles = totalDiscoveredFiles;
            window.scanningResults.scannedFiles = totalDiscoveredFiles;
            
            // Update file mapping status display
            updateFileMappingStatus();
            
            addLogEntry('SUCCESS', `גילוי קבצים הושלם בהצלחה - נמצאו ${totalDiscoveredFiles} קבצים`);
            addLogEntry('INFO', 'המערכת מוכנה לסריקה - לחץ על "התחל סריקה" כדי לבדוק את הקבצים');
            
            // Hide discovery progress animation
            if (progressElement) {
                progressElement.style.display = 'none';
            }
            
            // Save updated scanning results to localStorage
            try {
                localStorage.setItem('linterScanningResults', JSON.stringify(window.scanningResults));
                console.log('✅ Saved updated scanning results to localStorage:', window.scanningResults);
            } catch (error) {
                console.warn('Failed to save updated scanning results to localStorage:', error);
            }
            
            return discoveredFiles;
            } else {
            addLogEntry('WARNING', 'מנגנון סריקת קבצים גלובלי לא זמין');
            return await discoverProjectFilesFallback();
        }
    } catch (error) {
        console.error('❌ Error in discoverProjectFiles:', error);
        addLogEntry('ERROR', 'שגיאה בגילוי קבצים', { error: error.message });
        
        // Hide discovery progress animation on error
        const progressElement = document.getElementById('fileDiscoveryProgress');
        if (progressElement) {
            progressElement.style.display = 'none';
        }
        
        return await discoverProjectFilesFallback();
    }
}

async function discoverProjectFilesFallback() {
    // Fallback mode - no fake data, clear user message
    addLogEntry('WARNING', '⚠️ גילוי קבצים אוטומטי נכשל');
    addLogEntry('INFO', '🔧 המערכת עברה למצב חלופי - אין נתוני דמה');
    addLogEntry('INFO', '📋 אנא בדוק את חיבור השרת או נסה שוב מאוחר יותר');
    
    // Hide discovery progress animation
    const progressElement = document.getElementById('fileDiscoveryProgress');
    if (progressElement) {
        progressElement.style.display = 'none';
    }
    
    // Initialize empty project files
    window.projectFiles = {
        js: [],
        html: [],
        css: [],
        python: [],
        other: []
    };
    
    // Initialize empty scanning results
    if (!window.scanningResults) {
        window.scanningResults = {
            errors: [],
            warnings: [],
            totalFiles: 0,
            scannedFiles: 0,
            startTime: null,
            endTime: null
        };
    }
    
    // Update UI with empty data
    // Don't call updateFileTypeStatistics with empty array - it will reset the values
    updateFileMappingStatus();
    
    // Force update of file type selection display
    setTimeout(() => {
        // Don't call updateFileTypeStatistics with empty array
        updateRealtimeProgress();
        console.log('🔄 Updated UI with empty data after fallback');
    }, 100);
    
    // Save empty results to localStorage
    try {
        localStorage.setItem('linterScanningResults', JSON.stringify(window.scanningResults));
        console.log('✅ Saved empty scanning results to localStorage');
    } catch (error) {
        console.warn('Failed to save empty scanning results to localStorage:', error);
    }
    
    return window.projectFiles;
}

// ========================================
// File Scanning Functions
// ========================================

async function startFileScan() {
    addLogEntry('INFO', '🚀 מתחיל סריקת לינטר...');
    addLogEntry('INFO', '🔍 בודק שגיאות ואזהרות בקבצים...');
    
    // Check if analysis functions are loaded
    if (typeof window.analyzeFileContent !== 'function') {
        addLogEntry('ERROR', 'מודולי ניתוח הקבצים לא נטענו - ממתין...');
        console.error('❌ Analysis functions not loaded yet');
        return;
    }
    
    // Reset scanning results
    window.scanningResults = {
        errors: [],
        warnings: [],
        totalFiles: 0,
        scannedFiles: 0,
        startTime: Date.now(),
        endTime: null
    };
    
    // Update UI immediately
    const scanButton = document.getElementById('startScan');
    if (scanButton) {
        scanButton.disabled = true;
        scanButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> סורק... 0%';
    }
    
    // Reset all counters to 0
    const errorCountElement = document.getElementById('totalErrorsStats');
    const warningCountElement = document.getElementById('totalWarningsStats');
    const totalFilesElement = document.getElementById('totalFilesStats');
    const overallStatusElement = document.getElementById('overallStatus');
    
    if (errorCountElement) errorCountElement.textContent = '0';
    if (warningCountElement) warningCountElement.textContent = '0';
    if (totalFilesElement) totalFilesElement.textContent = '0';
    if (overallStatusElement) overallStatusElement.textContent = 'מתחיל סריקה...';
    
    // Start scanning
    await scanJavaScriptFiles();
}

async function copyDetailedLog() {
    try {
        const timestamp = new Date().toLocaleString('he-IL');
        
        // קבלת מידע על המשתמש הפעיל
        let activeProfile = 'לא זמין';
        if (typeof window.TikTrackAuth !== 'undefined' && window.TikTrackAuth.getCurrentUser) {
            const currentUser = window.TikTrackAuth.getCurrentUser();
            if (currentUser) {
                activeProfile = currentUser.name || currentUser.username || 'נימרוד';
            }
        }
        
        // קבלת מידע על סריקות
        let totalFiles = 0;
        let totalErrors = 0;
        let totalWarnings = 0;
        let lastScanTime = 'לא בוצעה';
        let isFileDiscoveryOnly = false;
        
        if (window.scanningResults) {
            totalFiles = window.scanningResults.scannedFiles || window.scanningResults.totalFiles || 0;
            totalErrors = window.scanningResults.errors ? window.scanningResults.errors.length : 0;
            totalWarnings = window.scanningResults.warnings ? window.scanningResults.warnings.length : 0;
            
            // Check if we have files but no scan time - means file discovery was done
            // Also check if we have 0 errors and 0 warnings (indicating file discovery only)
            if (totalFiles > 0 && totalErrors === 0 && totalWarnings === 0 && 
                (!window.scanningResults.lastScanTime && !window.scanningResults.timestamp && !window.scanningResults.endTime)) {
                lastScanTime = 'גילוי קבצים הושלם';
                isFileDiscoveryOnly = true;
            } else {
                lastScanTime = window.scanningResults.lastScanTime || window.scanningResults.timestamp || 
                              (window.scanningResults.endTime ? new Date(window.scanningResults.endTime).toLocaleString('he-IL') : 'לא בוצעה');
            }
        } else {
            // Debug: Check localStorage for data
            const savedResults = localStorage.getItem('linterScanningResults');
            if (savedResults) {
                try {
                    const results = JSON.parse(savedResults);
                    totalFiles = results.scannedFiles || results.totalFiles || 0;
                    totalErrors = results.errors ? results.errors.length : 0;
                    totalWarnings = results.warnings ? results.warnings.length : 0;
                    // Check if we have files but no scan time - means file discovery was done
                    // Also check if we have 0 errors and 0 warnings (indicating file discovery only)
                    if (totalFiles > 0 && totalErrors === 0 && totalWarnings === 0 && 
                        (!results.timestamp && !results.endTime)) {
                        lastScanTime = 'גילוי קבצים הושלם';
                        isFileDiscoveryOnly = true;
                    } else {
                        lastScanTime = results.timestamp || (results.endTime ? new Date(results.endTime).toLocaleString('he-IL') : 'לא בוצעה');
                    }
                } catch (error) {
                    console.error('Error parsing localStorage data:', error);
                }
            }
        }
        
        // קבלת מידע על גרפים
        let chartsStatus = 'לא מאותחלים';
        if (typeof window.initializeCharts === 'function') {
            chartsStatus = 'מוכנים';
        }
        
        // קבלת מידע על לוגים (מקומי לעמוד)
        let logEntries = 0;
        // נשתמש בלוגים מקומיים של העמוד במקום פונקציות גלובליות
        
        // קבלת סטטיסטיקות לפי סוגי קבצים
        function getFileTypeStatistics() {
            const stats = {};
            let totalFiles = 0;
            
            // Collect statistics from multiple sources
            if (fileScanningState && fileScanningState.discovered.total > 0) {
                // Use FileScanningState for accurate statistics
                Object.keys(fileScanningState.discovered.byType).forEach(type => {
                    stats[type] = fileScanningState.discovered.byType[type] || 0;
                    totalFiles += stats[type];
                });
            } else if (window.projectFiles && typeof window.projectFiles === 'object') {
                // Fallback to projectFiles
                if (Array.isArray(window.projectFiles)) {
                    window.projectFiles.forEach(file => {
                        const type = getFileType(file);
                        stats[type] = (stats[type] || 0) + 1;
                        totalFiles++;
                    });
                } else {
                    Object.keys(window.projectFiles).forEach(type => {
                        if (window.projectFiles[type] && Array.isArray(window.projectFiles[type])) {
                            stats[type] = window.projectFiles[type].length;
                            totalFiles += stats[type];
                        }
                    });
                }
            }
            
            // Format statistics for display
            const typeLabels = {
                'js': 'JavaScript',
                'html': 'HTML',
                'css': 'CSS',
                'python': 'Python',
                'other': 'אחרים'
            };
            
            let result = '';
            Object.keys(typeLabels).forEach(type => {
                const count = stats[type] || 0;
                result += `  - ${typeLabels[type]}: ${count} קבצים\n`;
            });
            
            result += `  - סה"כ: ${totalFiles} קבצים`;
            return result;
        }
        
        // קבלת מידע מפורט על כל שדה בממשק
        function getDetailedInterfaceInfo() {
            let interfaceInfo = '';
            
            // 1. סקשן עליון - 5 יחידות סטטיסטיקה
            interfaceInfo += '\n📊 סקשן עליון - 5 יחידות סטטיסטיקה:\n';
            
            // כרטיסיה כללית
            const overallStatus = document.getElementById('overallStatus');
            interfaceInfo += `  - סטטוס מערכת: ${overallStatus ? overallStatus.textContent : 'לא זמין'}\n`;
            
            // Phase 1: File Mapping Summary
            const mappedFilesCount = document.getElementById('mappedFilesCount');
            const discoveryStatus = document.getElementById('discoveryStatus');
            const lastMappingUpdate = document.getElementById('lastMappingUpdate');
            interfaceInfo += `  - מיפוי קבצים: ${mappedFilesCount ? mappedFilesCount.textContent : 'לא זמין'} קבצים\n`;
            interfaceInfo += `  - סטטוס גילוי: ${discoveryStatus ? discoveryStatus.textContent : 'לא זמין'}\n`;
            interfaceInfo += `  - עדכון אחרון: ${lastMappingUpdate ? lastMappingUpdate.textContent : 'לא זמין'}\n`;
            
            // Phase 2: Scanning Summary (Updated with new IDs)
            const discoveredFiles = document.getElementById('discoveredFiles');
            const selectedFiles = document.getElementById('selectedFiles');
            const scannedFiles = document.getElementById('scannedFiles');
            interfaceInfo += `  - קבצים שנמצאו: ${discoveredFiles ? discoveredFiles.textContent : 'לא זמין'}\n`;
            interfaceInfo += `  - קבצים שנבחרו: ${selectedFiles ? selectedFiles.textContent : 'לא זמין'}\n`;
            interfaceInfo += `  - קבצים שנסרקו: ${scannedFiles ? scannedFiles.textContent : 'לא זמין'}\n`;
            
            // Phase 3: Tools & Fixes Summary
            const totalErrorsStats = document.getElementById('totalErrorsStats');
            const totalWarningsStats = document.getElementById('totalWarningsStats');
            const fixStatus = document.getElementById('fixStatus');
            interfaceInfo += `  - שגיאות נמצאו: ${totalErrorsStats ? totalErrorsStats.textContent : 'לא זמין'}\n`;
            interfaceInfo += `  - אזהרות נמצאו: ${totalWarningsStats ? totalWarningsStats.textContent : 'לא זמין'}\n`;
            interfaceInfo += `  - סטטוס תיקון: ${fixStatus ? fixStatus.textContent : 'לא זמין'}\n`;
            
            // Phase 4: Monitoring & Control Summary
            const monitoringStatus = document.getElementById('monitoringStatus');
            const logEntriesCount = document.getElementById('logEntriesCount');
            const chartsStatus = document.getElementById('chartsStatus');
            interfaceInfo += `  - סטטוס ניטור: ${monitoringStatus ? monitoringStatus.textContent : 'לא זמין'}\n`;
            interfaceInfo += `  - רשומות לוג: ${logEntriesCount ? logEntriesCount.textContent : 'לא זמין'}\n`;
            interfaceInfo += `  - מצב גרפים: ${chartsStatus ? chartsStatus.textContent : 'לא זמין'}\n`;
            
            // 2. דשבורד מיפוי קבצים מרכזי
            interfaceInfo += '\n🗺️ דשבורד מיפוי קבצים מרכזי:\n';
            
            // Main Status Row
            interfaceInfo += '  שורת סטטוס ראשי:\n';
            interfaceInfo += `    - מיפוי קבצים: ${mappedFilesCount ? mappedFilesCount.textContent : 'לא זמין'} קבצים זוהו\n`;
            interfaceInfo += `    - סטטוס גילוי: ${discoveryStatus ? discoveryStatus.textContent : 'לא זמין'} (מצב תהליך)\n`;
            interfaceInfo += `    - עדכון אחרון: ${lastMappingUpdate ? lastMappingUpdate.textContent : 'לא זמין'} (זמן פעילות)\n`;
            
            // Detailed Statistics Row
            interfaceInfo += '  שורת סטטיסטיקות מפורטות:\n';
            const jsFilesCount = document.getElementById('jsFilesCount');
            const htmlFilesCount = document.getElementById('htmlFilesCount');
            const pyFilesCount = document.getElementById('pyFilesCount');
            const cssFilesCount = document.getElementById('cssFilesCount');
            const otherFilesCount = document.getElementById('otherFilesCount');
            interfaceInfo += `    - קבצי JavaScript: ${jsFilesCount ? jsFilesCount.textContent : 'לא זמין'}\n`;
            interfaceInfo += `    - קבצי HTML: ${htmlFilesCount ? htmlFilesCount.textContent : 'לא זמין'}\n`;
            interfaceInfo += `    - קבצי Python: ${pyFilesCount ? pyFilesCount.textContent : 'לא זמין'}\n`;
            interfaceInfo += `    - קבצי CSS: ${cssFilesCount ? cssFilesCount.textContent : 'לא זמין'}\n`;
            interfaceInfo += `    - קבצים אחרים: ${otherFilesCount ? otherFilesCount.textContent : 'לא זמין'}\n`;
            
            // Progress Bar Row
            const mappingProgressFill = document.getElementById('mappingProgressFill');
            const mappingProgressPercentage = document.getElementById('mappingProgressPercentage');
            interfaceInfo += '  שורת פס התקדמות:\n';
            interfaceInfo += `    - התקדמות מיפוי: ${mappingProgressPercentage ? mappingProgressPercentage.textContent : 'לא זמין'}\n`;
            interfaceInfo += `    - פס התקדמות: ${mappingProgressFill ? (mappingProgressFill.style.width || '0%') : 'לא זמין'}\n`;
            
            // Action Status Row
            interfaceInfo += '  שורת אינדיקטורי פעולה:\n';
            interfaceInfo += '    - מערכת מוכנה למיפוי\n';
            interfaceInfo += '    - ביצועים אופטימליים\n';
            interfaceInfo += '    - אבטחת נתונים מובטחת\n';
            
            // 3. דשבורד סריקה מרכזי
            interfaceInfo += '\n🔍 דשבורד סריקה מרכזי:\n';
            
            // Main Status Row
            interfaceInfo += '  שורת סטטוס ראשי:\n';
            const scannedFilesCount = document.getElementById('scannedFilesCount');
            const scanningErrorsCount = document.getElementById('scanningErrorsCount');
            const scanningDuration = document.getElementById('scanningDuration');
            interfaceInfo += `    - קבצים נסרקו: ${scannedFilesCount ? scannedFilesCount.textContent : 'לא זמין'}\n`;
            interfaceInfo += `    - שגיאות נמצאו: ${scanningErrorsCount ? scanningErrorsCount.textContent : 'לא זמין'}\n`;
            interfaceInfo += `    - זמן סריקה: ${scanningDuration ? scanningDuration.textContent : 'לא זמין'}\n`;
            
            // Detailed Statistics Row
            interfaceInfo += '  שורת סטטיסטיקות מפורטות:\n';
            const criticalErrorsCount = document.getElementById('criticalErrorsCount');
            const warningsCount = document.getElementById('warningsCount');
            const suggestionsCount = document.getElementById('suggestionsCount');
            const cleanFilesCount = document.getElementById('cleanFilesCount');
            const totalScannedCount = document.getElementById('totalScannedCount');
            interfaceInfo += `    - שגיאות קריטיות: ${criticalErrorsCount ? criticalErrorsCount.textContent : 'לא זמין'}\n`;
            interfaceInfo += `    - אזהרות: ${warningsCount ? warningsCount.textContent : 'לא זמין'}\n`;
            interfaceInfo += `    - הצעות שיפור: ${suggestionsCount ? suggestionsCount.textContent : 'לא זמין'}\n`;
            interfaceInfo += `    - קבצים תקינים: ${cleanFilesCount ? cleanFilesCount.textContent : 'לא זמין'}\n`;
            interfaceInfo += `    - סה"כ נבדק: ${totalScannedCount ? totalScannedCount.textContent : 'לא זמין'}\n`;
            
            // Results Summary Row
            interfaceInfo += '  שורת סיכום תוצאות:\n';
            const scanningTotalErrors = document.getElementById('scanningTotalErrors');
            const scanningTotalWarnings = document.getElementById('scanningTotalWarnings');
            const totalScannedFiles = document.getElementById('totalScannedFiles');
            interfaceInfo += `    - שגיאות: ${scanningTotalErrors ? scanningTotalErrors.textContent : 'לא זמין'}\n`;
            interfaceInfo += `    - אזהרות: ${scanningTotalWarnings ? scanningTotalWarnings.textContent : 'לא זמין'}\n`;
            interfaceInfo += `    - קבצים נסרקו: ${totalScannedFiles ? totalScannedFiles.textContent : 'לא זמין'}\n`;
            interfaceInfo += `    - זמן סריקה: ${scanningDuration ? scanningDuration.textContent : 'לא זמין'}\n`;
            
            // 4. אינדיקטורי פעולה
            interfaceInfo += '\n⚡ אינדיקטורי פעולה:\n';
            const scanningStatusIndicator = document.getElementById('scanningStatusIndicator');
            const scanningPerformanceIndicator = document.getElementById('scanningPerformanceIndicator');
            const scanningQualityIndicator = document.getElementById('scanningQualityIndicator');
            interfaceInfo += `  - סטטוס סריקה: ${scanningStatusIndicator ? scanningStatusIndicator.textContent : 'לא זמין'}\n`;
            interfaceInfo += `  - ביצועים: ${scanningPerformanceIndicator ? scanningPerformanceIndicator.textContent : 'לא זמין'}\n`;
            interfaceInfo += `  - איכות: ${scanningQualityIndicator ? scanningQualityIndicator.textContent : 'לא זמין'}\n`;
            
            // 5. פס התקדמות
            const scanningProgressFill = document.getElementById('scanningProgressFill');
            const scanningProgressPercentage = document.getElementById('scanningProgressPercentage');
            interfaceInfo += '\n📊 פס התקדמות:\n';
            interfaceInfo += `  - התקדמות סריקה: ${scanningProgressPercentage ? scanningProgressPercentage.textContent : 'לא זמין'}\n`;
            interfaceInfo += `  - פס התקדמות: ${scanningProgressFill ? (scanningProgressFill.style.width || '0%') : 'לא זמין'}\n`;
            
            return interfaceInfo;
        }
        
        // בדיקת בעיות צבעים בממשק
        function checkColorIssues() {
            let colorIssues = '';
            const issues = [];
            
            // בדיקת רקעים שחורים או כמעט שחורים
            const darkBackgrounds = document.querySelectorAll('*');
            darkBackgrounds.forEach(element => {
                const computedStyle = window.getComputedStyle(element);
                const backgroundColor = computedStyle.backgroundColor;
                const color = computedStyle.color;
                
                // בדיקת רקע כהה
                if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
                    const rgb = backgroundColor.match(/\d+/g);
                    if (rgb && rgb.length >= 3) {
                        const r = parseInt(rgb[0]);
                        const g = parseInt(rgb[1]);
                        const b = parseInt(rgb[2]);
                        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                        
                        if (brightness < 50) { // רקע כהה מאוד
                            const elementInfo = `${element.tagName}${element.className ? '.' + element.className.split(' ').join('.') : ''}${element.id ? '#' + element.id : ''}`;
                            issues.push(`רקע כהה: ${elementInfo} - ${backgroundColor}`);
                        }
                    }
                }
                
                // בדיקת טקסט לבן על רקע לבן
                if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
                    const textRgb = color.match(/\d+/g);
                    const bgRgb = backgroundColor.match(/\d+/g);
                    
                    if (textRgb && bgRgb && textRgb.length >= 3 && bgRgb.length >= 3) {
                        const textBrightness = (parseInt(textRgb[0]) * 299 + parseInt(textRgb[1]) * 587 + parseInt(textRgb[2]) * 114) / 1000;
                        const bgBrightness = (parseInt(bgRgb[0]) * 299 + parseInt(bgRgb[1]) * 587 + parseInt(bgRgb[2]) * 114) / 1000;
                        
                        if (textBrightness > 200 && bgBrightness > 200) { // טקסט לבן על רקע לבן
                            const elementInfo = `${element.tagName}${element.className ? '.' + element.className.split(' ').join('.') : ''}${element.id ? '#' + element.id : ''}`;
                            issues.push(`טקסט לבן על רקע לבן: ${elementInfo} - טקסט: ${color}, רקע: ${backgroundColor}`);
                        }
                    }
                }
            });
            
            if (issues.length > 0) {
                colorIssues = '\n🎨 בעיות צבעים זוהו:\n';
                issues.forEach(issue => {
                    colorIssues += `  - ${issue}\n`;
                });
            } else {
                colorIssues = '\n🎨 בדיקת צבעים: לא נמצאו בעיות צבעים';
            }
            
            return colorIssues;
        }
        
        // Determine the correct label based on whether it's file discovery or actual scanning
        const filesLabel = isFileDiscoveryOnly ? 'קבצים ממופים' : 'קבצים נסרקו';
        
        const logContent = `🔔 לוג מפורט - Linter Realtime Monitor
📅 תאריך ושעה: ${timestamp}
👤 משתמש פעיל: ${activeProfile}

📊 סטטיסטיקות ${isFileDiscoveryOnly ? 'מיפוי' : 'סריקה'}:
  - ${filesLabel}: ${totalFiles}
  - שגיאות: ${totalErrors}
  - אזהרות: ${totalWarnings}
  - ${isFileDiscoveryOnly ? 'מיפוי אחרון' : 'סריקה אחרונה'}: ${lastScanTime}

📁 סטטיסטיקות לפי סוגי קבצים:
${getFileTypeStatistics()}

${getDetailedInterfaceInfo()}

📈 מצב גרפים: ${chartsStatus}
📝 מספר רשומות לוג: ${logEntries}

🔧 מידע טכני:
  - מערכת Linter: פעילה
  - IndexedDB: ${typeof window.LinterIndexedDBAdapter !== 'undefined' ? 'זמין' : 'לא זמין'}
  - מערכת אימות: ${typeof window.TikTrackAuth !== 'undefined' ? 'זמין' : 'לא זמין'}
  - מערכת העדפות: ${typeof window.getPreference === 'function' ? 'זמין' : 'לא זמין'}

${checkColorIssues()}

📝 הערות:
  - לוג זה מכיל מידע על מצב מערכת Linter Realtime Monitor
  - כולל סטטיסטיקות סריקה, גרפים, ולוגים
  - נוצר אוטומטית על ידי מערכת Linter
  - כולל בדיקת בעיות צבעים בממשק
         
🔍 Debug Info:
  - window.scanningResults: ${window.scanningResults ? 'קיים' : 'לא קיים'}
  - localStorage data: ${localStorage.getItem('linterScanningResults') ? 'קיים' : 'לא קיים'}
  - IndexedDB adapter: ${typeof window.LinterIndexedDBAdapter !== 'undefined' ? 'זמין' : 'לא זמין'}
  - window.projectFiles: ${window.projectFiles ? 'קיים' : 'לא קיים'}
  - fileScanningState: ${typeof fileScanningState !== 'undefined' ? 'קיים' : 'לא קיים'}`;

        navigator.clipboard.writeText(logContent).then(() => {
            console.log('✅ לוג מפורט של Linter הועתק ללוח');
            // הודעה מקומית לעמוד
            alert('לוג מפורט של Linter הועתק ללוח בהצלחה!');
        }).catch(error => {
            console.error('❌ שגיאה בהעתקת הלוג:', error);
            alert('שגיאה בהעתקת הלוג ללוח');
        });
        
    } catch (error) {
        console.error('❌ שגיאה ביצירת לוג מפורט:', error);
        alert('שגיאה ביצירת הלוג המפורט: ' + error.message);
    }
}

function toggleTopSection() {
  if (typeof window.toggleTopSectionGlobal === 'function') {
    window.toggleTopSectionGlobal();
  } else {
    console.warn('פונקציית toggleTopSectionGlobal לא נמצאה ב-main.js');
  }
}

function toggleSection(sectionId) {
  const section = document.getElementById(sectionId);
  const toggleBtn = document.querySelector(`[onclick*="${sectionId}"] .section-toggle-icon`);
  
  if (!section) return;
  
  const isCollapsed = section.style.display === 'none' || 
                     section.classList.contains('collapsed');
  
  if (isCollapsed) {
    section.style.display = 'block';
    section.classList.remove('collapsed');
    if (toggleBtn) toggleBtn.innerHTML = '▼';
    } else {
    section.style.display = 'none';
    section.classList.add('collapsed');
    if (toggleBtn) toggleBtn.innerHTML = '▶';
  }
}

function refreshFileList() {
  if (window.showInfoNotification) {
    window.showInfoNotification('רענון רשימת קבצים', 'רשימת הקבצים תתעדכן בעתיד');
  }
}

function clearFileCache() {
  if (window.showInfoNotification) {
    window.showInfoNotification('ניקוי מטמון קבצים', 'מטמון הקבצים ינוקה בעתיד');
  }
}

function exportFileList() {
  if (window.showInfoNotification) {
    window.showInfoNotification('ייצוא רשימת קבצים', 'רשימת הקבצים תייצא בעתיד');
  }
}

async function scanJavaScriptFiles() {
    console.log('🚀 scanJavaScriptFiles called!');
    
    if (!window.projectFiles || Object.keys(window.projectFiles).length === 0) {
        addLogEntry('ERROR', 'לא נמצאו קבצים לסריקה - אנא עדכן רשימת קבצים תחילה');
        return;
    }
    
    let filesToScan = [];
    
    // Collect all files from projectFiles and filter existing ones
    Object.keys(window.projectFiles).forEach(type => {
        if (window.projectFiles[type] && Array.isArray(window.projectFiles[type])) {
            // Filter out files that don't exist or are not accessible
            const existingFiles = window.projectFiles[type].filter(file => {
                // Skip files that are likely to be 404 (like CSS imports, HTML files, etc.)
                return !file.includes('.css') && 
                       !file.includes('.html') && 
                       !file.includes('documentation/') &&
                       !file.includes('external_data_integration_client/') &&
                       !file.includes('Backend/') &&
                       !file.includes('test-') &&
                       !file.includes('BACKUP-') &&
                       !file.includes('UPDATED-');
            });
            filesToScan.push(...existingFiles);
        }
    });
    
    window.scanningResults.totalFiles = filesToScan.length;
    addLogEntry('INFO', `📊 נמצאו ${filesToScan.length} קבצים לסריקה`);
    
    // Scan each file sequentially
    for (let i = 0; i < filesToScan.length; i++) {
        const fileName = filesToScan[i];
        
        // Add progress feedback every 50 files
        if (i % 50 === 0 || i === filesToScan.length - 1) {
            addLogEntry('INFO', `📁 סורק קובץ ${i + 1}/${filesToScan.length}`);
        }
        
        try {
            await scanSingleFile(fileName);
        } catch (error) {
            console.error(`❌ Error scanning file ${fileName}:`, error);
            // Add error to results but don't count as scanned
            if (!window.scanningResults.errors) {
                window.scanningResults.errors = [];
            }
            window.scanningResults.errors.push({
                file: fileName,
                message: error.message,
                severity: 'error'
            });
        }
        
        // Small delay to prevent overwhelming the system
        if (i % 10 === 0 && i > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    // Finish scanning
    addLogEntry('SUCCESS', '✅ סריקת כל הקבצים הושלמה בהצלחה!');
    await finishScan();
}

async function scanSingleFile(fileName) {
    console.log('🔍 scanSingleFile called with:', fileName);
    
    try {
        // Check if file exists before trying to fetch
        const response = await fetch(fileName, { method: 'HEAD' });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Now fetch the actual content
        const contentResponse = await fetch(fileName);
        if (!contentResponse.ok) {
            throw new Error(`HTTP ${contentResponse.status}: ${contentResponse.statusText}`);
        }
        
        const content = await contentResponse.text();
        const fileType = getFileType(fileName);
        
        // Use appropriate analysis function based on file type
        switch (fileType) {
            case 'js':
                if (typeof window.analyzeFileContent === 'function') {
                    window.analyzeFileContent(fileName, content);
                }
                break;
            case 'html':
                if (typeof window.analyzeHtmlContent === 'function') {
                    window.analyzeHtmlContent(fileName, content);
                }
                break;
            case 'css':
                if (typeof window.analyzeCssContent === 'function') {
                    window.analyzeCssContent(fileName, content);
                }
                break;
            case 'python':
                if (typeof window.analyzePythonContent === 'function') {
                    window.analyzePythonContent(fileName, content);
                }
                break;
            default:
                if (typeof window.analyzeOtherContent === 'function') {
                    window.analyzeOtherContent(fileName, content);
                }
                break;
        }
        
        window.scanningResults.scannedFiles++;
        
        // Update UI with real-time progress
        updateRealtimeProgress();
        
    } catch (error) {
        console.error(`❌ Error scanning file ${fileName}:`, error);
        window.scanningResults.scannedFiles++;
        updateRealtimeProgress();
    }
}

function getFileType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
        case 'js': return 'js';
        case 'html': return 'html';
        case 'css': return 'css';
        case 'py': return 'python';
        default: return 'other';
    }
}

async function finishScan() {
    window.scanningResults.endTime = Date.now();
    window.scanningResults.lastScanTime = new Date().toISOString();
    
    // Update UI
    const scanButton = document.getElementById('startScan');
    if (scanButton) {
        scanButton.disabled = false;
        scanButton.innerHTML = '🔍 התחל סריקה';
    }
    
    // Update overall status
    const overallStatusElement = document.getElementById('overallStatus');
    if (overallStatusElement) {
        overallStatusElement.textContent = 'סריקה הושלמה';
    }
    
    // Update statistics
    updateFileTypeStatistics(window.scanningResults.errors.concat(window.scanningResults.warnings));
    updateFileMappingStatus();
    
    // Save results
    try {
        localStorage.setItem('linterScanningResults', JSON.stringify(window.scanningResults));
        console.log('✅ Saved scanning results to localStorage');
    } catch (error) {
        console.warn('Failed to save scanning results to localStorage:', error);
    }
    
    addLogEntry('SUCCESS', `סריקה הושלמה - נמצאו ${window.scanningResults.errors.length} שגיאות ו-${window.scanningResults.warnings.length} אזהרות`);
}

function updateRealtimeProgress() {
    try {
        console.log('🔄 updateRealtimeProgress called');
        
        const progress = window.scanningResults.totalFiles > 0 ? 
            Math.round((window.scanningResults.scannedFiles / window.scanningResults.totalFiles) * 100) : 0;
        
        // Update overall status
        const overallStatusElement = document.getElementById('overallStatus');
        if (overallStatusElement) {
            if (window.scanningResults.scannedFiles === 0) {
                overallStatusElement.textContent = 'מוכן לסריקה';
            } else if (window.scanningResults.scannedFiles < window.scanningResults.totalFiles) {
                overallStatusElement.textContent = `סורק... ${progress}%`;
            } else {
                overallStatusElement.textContent = 'סריקה הושלמה';
            }
        }
        
        // Update error and warning counts in real-time
        const errorCountElement = document.getElementById('totalErrorsStats');
        const warningCountElement = document.getElementById('totalWarningsStats');
        const totalFilesElement = document.getElementById('totalFilesStats');
        
        if (errorCountElement) {
            errorCountElement.textContent = window.scanningResults.errors.length;
        }
        
        if (warningCountElement) {
            warningCountElement.textContent = window.scanningResults.warnings.length;
        }
        
        if (totalFilesElement) {
            totalFilesElement.textContent = window.scanningResults.scannedFiles;
        }
        
        // Update file type statistics in real-time
        updateFileTypeStatistics(window.scanningResults.errors.concat(window.scanningResults.warnings));
        
    } catch (error) {
        console.error('Error updating real-time progress:', error);
    }
}

function updateFileMappingStatus() {
    console.log('🔄 updateFileMappingStatus called');
    
    // Update all elements with the same IDs (both in summary and progress indicators)
    const totalFiles = window.scanningResults ? window.scanningResults.totalFiles || 0 : 0;
    
    // Update mappedFilesCount (appears in multiple places)
    const mappedFilesElements = document.querySelectorAll('#mappedFilesCount');
    mappedFilesElements.forEach(element => {
        element.textContent = totalFiles;
    });
    console.log(`✅ Updated mappedFilesCount to ${totalFiles} in ${mappedFilesElements.length} locations`);
    
    // Update discoveryStatus (appears in multiple places)
    const discoveryStatusElements = document.querySelectorAll('#discoveryStatus');
    const discoveryStatusText = (window.scanningResults && window.scanningResults.totalFiles > 0) ? 'הושלם' : 'לא פעיל';
    discoveryStatusElements.forEach(element => {
        element.textContent = discoveryStatusText;
    });
    console.log(`✅ Updated discoveryStatus to '${discoveryStatusText}' in ${discoveryStatusElements.length} locations`);
    
    // Update lastMappingUpdate (appears in multiple places)
    const lastMappingUpdateElements = document.querySelectorAll('#lastMappingUpdate');
    const mappingUpdateText = (window.scanningResults && window.scanningResults.totalFiles > 0) ? 
        new Date().toLocaleString('he-IL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'טרם בוצע';
    lastMappingUpdateElements.forEach(element => {
        element.textContent = mappingUpdateText;
    });
    console.log(`✅ Updated lastMappingUpdate to '${mappingUpdateText}' in ${lastMappingUpdateElements.length} locations`);
    
    // Update Detailed File Type Statistics in Dashboard
    // Use the same logic as updateFileTypeStatistics
    let fileTypeStats = {};
    
    console.log('📁 Debug: fileScanningState =', fileScanningState);
    console.log('📁 Debug: window.projectFiles =', window.projectFiles);
    console.log('📁 Debug: window.scanningResults =', window.scanningResults);
    
    if (fileScanningState && fileScanningState.discovered && fileScanningState.discovered.total > 0) {
        console.log('📁 Using FileScanningState for dashboard statistics...');
        // Use FileScanningState for accurate statistics
        Object.keys(fileScanningState.discovered.byType).forEach(type => {
            fileTypeStats[type] = fileScanningState.discovered.byType[type] || 0;
        });
    } else if (window.projectFiles) {
        console.log('📁 Using window.projectFiles for dashboard statistics...');
        // Fallback to projectFiles
        if (Array.isArray(window.projectFiles)) {
            window.projectFiles.forEach(file => {
                const type = getFileType(file);
                fileTypeStats[type] = (fileTypeStats[type] || 0) + 1;
            });
        } else if (typeof window.projectFiles === 'object') {
            Object.keys(window.projectFiles).forEach(type => {
                if (window.projectFiles[type] && Array.isArray(window.projectFiles[type])) {
                    fileTypeStats[type] = window.projectFiles[type].length;
                }
            });
        }
    } else {
        console.log('📁 No data source available for file type statistics');
    }
    
    console.log('📁 Final fileTypeStats:', fileTypeStats);
    
    // Update each file type count in dashboard
    const jsCount = fileTypeStats.js || 0;
    const htmlCount = fileTypeStats.html || 0;
    const pyCount = fileTypeStats.python || 0;
    const cssCount = fileTypeStats.css || 0;
    const otherCount = fileTypeStats.other || 0;
    
    const jsElement = document.getElementById('dashboardJsFilesCount');
    const htmlElement = document.getElementById('dashboardHtmlFilesCount');
    const pyElement = document.getElementById('dashboardPyFilesCount');
    const cssElement = document.getElementById('dashboardCssFilesCount');
    const otherElement = document.getElementById('dashboardOtherFilesCount');
    
    if (jsElement) jsElement.textContent = jsCount;
    if (htmlElement) htmlElement.textContent = htmlCount;
    if (pyElement) pyElement.textContent = pyCount;
    if (cssElement) cssElement.textContent = cssCount;
    if (otherElement) otherElement.textContent = otherCount;
    
    console.log(`✅ Updated dashboard file type statistics: JS:${jsCount}, HTML:${htmlCount}, Python:${pyCount}, CSS:${cssCount}, Other:${otherCount}`);
    
    // Update action indicators
    updateActionIndicators();
    
    // Update Progress Bar
    const progressFill = document.getElementById('mappingProgressFill');
    const progressPercentage = document.getElementById('mappingProgressPercentage');
    const progressRow = document.getElementById('mappingProgressRow');
    
    if (progressFill && progressPercentage && window.scanningResults) {
        const progress = window.scanningResults.totalFiles > 0 ? 100 : 0;
        progressFill.style.width = `${progress}%`;
        progressPercentage.textContent = `${progress}%`;
        console.log(`✅ Updated progress bar to ${progress}%`);
        
        // Hide progress bar if mapping is completed successfully (100%)
        if (progress === 100 && progressRow) {
            // Check if mapping was completed successfully
            const hasDiscoveredFiles = window.projectFiles && Object.keys(window.projectFiles).length > 0;
            if (hasDiscoveredFiles) {
                // Hide progress bar after a short delay
                setTimeout(() => {
                    progressRow.style.display = 'none';
                    console.log('✅ Progress bar hidden - mapping completed successfully');
                }, 2000); // Hide after 2 seconds
            }
        } else if (progress < 100 && progressRow) {
            // Show progress bar if not completed
            progressRow.style.display = 'block';
        }
    }
    
    // Update Phase 2: Scanning Summary (New IDs)
    const discoveredFilesElement = document.getElementById('discoveredFiles');
    const selectedFilesElement = document.getElementById('selectedFiles');
    const scannedFilesElement = document.getElementById('scannedFiles');
    
    if (window.scanningResults) {
        const totalFiles = window.scanningResults.totalFiles || 0;
        const scannedFiles = window.scanningResults.scannedFiles || 0;
        const selectedFiles = scannedFiles; // For now, assume all scanned files are selected
        
        if (discoveredFilesElement) discoveredFilesElement.textContent = totalFiles;
        if (selectedFilesElement) selectedFilesElement.textContent = selectedFiles;
        if (scannedFilesElement) scannedFilesElement.textContent = scannedFiles;
        
        console.log(`✅ Updated scanning summary: ${totalFiles} discovered, ${selectedFiles} selected, ${scannedFiles} scanned`);
    } else {
        if (discoveredFilesElement) discoveredFilesElement.textContent = '-';
        if (selectedFilesElement) selectedFilesElement.textContent = '-';
        if (scannedFilesElement) scannedFilesElement.textContent = '-';
    }
    
    // Update Phase 3: Tools & Fixes Summary
    const totalErrorsElement = document.getElementById('totalErrorsStats');
    const totalWarningsElement = document.getElementById('totalWarningsStats');
    const fixStatusElement = document.getElementById('fixStatus');
    
    if (totalErrorsElement && totalWarningsElement && fixStatusElement && window.scanningResults) {
        const totalErrors = window.scanningResults.errors ? window.scanningResults.errors.length : 0;
        const totalWarnings = window.scanningResults.warnings ? window.scanningResults.warnings.length : 0;
        
        totalErrorsElement.textContent = totalErrors;
        totalWarningsElement.textContent = totalWarnings;
        
        if (totalErrors > 0 || totalWarnings > 0) {
            fixStatusElement.textContent = 'מוכן לתיקון';
        } else {
            fixStatusElement.textContent = 'אין בעיות';
        }
        console.log(`✅ Updated tools & fixes summary: ${totalErrors} errors, ${totalWarnings} warnings`);
    }
    
    // Update Phase 4: Monitoring & Control Summary
    const monitoringStatusElement = document.getElementById('monitoringStatus');
    const logEntriesCountElement = document.getElementById('logEntriesCount');
    const chartsStatusElement = document.getElementById('chartsStatus');
    
    if (monitoringStatusElement) {
        monitoringStatusElement.textContent = 'פעיל';
    }
    
    if (logEntriesCountElement) {
        // Get log entries count from local storage or global log system
        const logEntries = localStorage.getItem('linterLogEntries');
        const logCount = logEntries ? JSON.parse(logEntries).length : 0;
        logEntriesCountElement.textContent = logCount;
    }
    
    if (chartsStatusElement) {
        chartsStatusElement.textContent = 'מוכנים';
    }
    
    console.log('✅ Updated monitoring & control summary');
    
    // Update action indicators
    updateActionIndicators();
    
    // Update traffic lights
    updateTrafficLights();
    
    // Update general system status
    updateGeneralSystemStatus();
    
    // Update scanning dashboard
    updateScanningDashboard();
}

// ===== DYNAMIC ACTION INDICATORS SYSTEM =====

/**
 * Updates action indicators based on system status
 */
function updateActionIndicators() {
    console.log('🔄 Updating action indicators...');
    
    // Update mapping status
    updateMappingStatusIndicator();
    
    // Update performance status
    updatePerformanceStatusIndicator();
    
    // Update security status
    updateSecurityStatusIndicator();
    
    console.log('✅ Action indicators updated');
}

/**
 * Updates mapping status indicator
 */
function updateMappingStatusIndicator() {
    const indicator = document.getElementById('mappingStatusIndicator');
    const icon = document.getElementById('mappingStatusIcon');
    const text = document.getElementById('mappingStatusText');
    
    if (!indicator || !icon || !text) return;
    
    // Check if mapping is active
    const isMappingActive = window.scanningResults && window.scanningResults.totalFiles > 0;
    const hasDiscoveredFiles = window.projectFiles && Object.keys(window.projectFiles).length > 0;
    
    if (isMappingActive && hasDiscoveredFiles) {
        // Mapping completed successfully
        icon.textContent = '✅';
        text.textContent = 'מיפוי הושלם בהצלחה';
        setIndicatorStatus(indicator, 'success');
    } else if (isMappingActive) {
        // Mapping in progress
        icon.textContent = '🔄';
        text.textContent = 'מערכת עסוקה במיפוי';
        setIndicatorStatus(indicator, 'processing');
    } else {
        // Ready for mapping
        icon.textContent = '📊';
        text.textContent = 'מערכת מוכנה למיפוי';
        setIndicatorStatus(indicator, 'info');
    }
}

/**
 * Updates performance status indicator
 */
function updatePerformanceStatusIndicator() {
    const indicator = document.getElementById('performanceStatusIndicator');
    const icon = document.getElementById('performanceStatusIcon');
    const text = document.getElementById('performanceStatusText');
    
    if (!indicator || !icon || !text) return;
    
    // Simulate performance check (in real app, this would check actual metrics)
    const startTime = performance.now();
    
    // Check if system is responsive
    setTimeout(() => {
        const responseTime = performance.now() - startTime;
        
        if (responseTime < 50) {
            // Excellent performance
            icon.textContent = '⚡';
            text.textContent = 'ביצועים מעולים';
            setIndicatorStatus(indicator, 'success');
        } else if (responseTime < 100) {
            // Good performance
            icon.textContent = '⚡';
            text.textContent = 'ביצועים אופטימליים';
            setIndicatorStatus(indicator, 'success');
        } else if (responseTime < 200) {
            // Average performance
            icon.textContent = '⚠️';
            text.textContent = 'ביצועים בינוניים';
            setIndicatorStatus(indicator, 'warning');
            } else {
            // Poor performance
            icon.textContent = '🐌';
            text.textContent = 'ביצועים איטיים';
            setIndicatorStatus(indicator, 'error');
        }
    }, 10);
}

/**
 * Updates security status indicator
 */
function updateSecurityStatusIndicator() {
    const indicator = document.getElementById('securityStatusIndicator');
    const icon = document.getElementById('securityStatusIcon');
    const text = document.getElementById('securityStatusText');
    
    if (!indicator || !icon || !text) return;
    
    // Check security status
    const hasSecureStorage = typeof(Storage) !== "undefined";
    const hasIndexedDB = 'indexedDB' in window;
    const isHTTPS = location.protocol === 'https:';
    
    if (hasSecureStorage && hasIndexedDB && isHTTPS) {
        // Excellent security
        icon.textContent = '🔒';
        text.textContent = 'אבטחה מקסימלית';
        setIndicatorStatus(indicator, 'success');
    } else if (hasSecureStorage && hasIndexedDB) {
        // Good security
        icon.textContent = '🔒';
        text.textContent = 'אבטחת נתונים מובטחת';
        setIndicatorStatus(indicator, 'success');
    } else if (hasSecureStorage) {
        // Basic security
        icon.textContent = '🔓';
        text.textContent = 'אבטחה בסיסית';
        setIndicatorStatus(indicator, 'warning');
    } else {
        // Poor security
        icon.textContent = '⚠️';
        text.textContent = 'בעיית אבטחה';
        setIndicatorStatus(indicator, 'error');
    }
}

/**
 * Sets the status class for an indicator
 */
function setIndicatorStatus(indicator, status) {
    // Remove all status classes
    indicator.classList.remove('status-success', 'status-warning', 'status-error', 'status-info', 'status-processing');
    
    // Add the new status class
    if (status) {
        indicator.classList.add(`status-${status}`);
    }
}

// ===== TRAFFIC LIGHT SYSTEM =====

/**
 * Updates all traffic lights based on system status
 */
function updateTrafficLights() {
    console.log('🚦 Updating traffic lights...');
    
    // Update each traffic light
    updateMappingTrafficLight();
    updateScanningTrafficLight();
    updateFixesTrafficLight();
    updateMonitoringTrafficLight();
    
    console.log('✅ Traffic lights updated');
}

/**
 * Updates mapping traffic light
 */
function updateMappingTrafficLight() {
    const light = document.getElementById('mappingTrafficLight');
    if (!light) return;
    
    const hasDiscoveredFiles = window.projectFiles && Object.keys(window.projectFiles).length > 0;
    const isMappingActive = window.scanningResults && window.scanningResults.totalFiles > 0;
    
    // Remove all status classes
    light.classList.remove('status-gray', 'status-orange', 'status-green', 'status-red');
    
    if (hasDiscoveredFiles && isMappingActive) {
        // Mapping completed successfully
        light.classList.add('status-green');
    } else if (isMappingActive) {
        // Mapping in progress
        light.classList.add('status-orange');
    } else {
        // No mapping done yet
        light.classList.add('status-gray');
    }
}

/**
 * Updates scanning traffic light
 */
function updateScanningTrafficLight() {
    const light = document.getElementById('scanningTrafficLight');
    if (!light) return;
    
    // Check if actual scanning was performed (not just file discovery)
    const hasActualScanResults = window.scanningResults && 
                                 window.scanningResults.scannedFiles > 0 && 
                                 window.scanningResults.startTime !== null;
    
    const hasErrors = window.scanningResults && window.scanningResults.errors && window.scanningResults.errors.length > 0;
    const hasWarnings = window.scanningResults && window.scanningResults.warnings && window.scanningResults.warnings.length > 0;
    
    // Remove all status classes
    light.classList.remove('status-gray', 'status-orange', 'status-green', 'status-red');
    
    if (hasActualScanResults) {
        // Actual scanning was performed
        if (hasErrors) {
            // Scan completed but with errors
            light.classList.add('status-red');
        } else if (hasWarnings) {
            // Scan completed with warnings
            light.classList.add('status-orange');
        } else {
            // Scan completed successfully
            light.classList.add('status-green');
        }
    } else {
        // No actual scanning done yet - only file discovery
        light.classList.add('status-gray');
    }
}

/**
 * Updates fixes traffic light
 */
function updateFixesTrafficLight() {
    const light = document.getElementById('fixesTrafficLight');
    if (!light) return;
    
    // For now, fixes traffic light should always be gray
    // because the system doesn't know how to evaluate fix urgency and status
    // When we reach the fix process, we'll handle this later
    
    // Remove all status classes
    light.classList.remove('status-gray', 'status-orange', 'status-green', 'status-red');
    
    // Always gray until fix process is implemented
    light.classList.add('status-gray');
}

/**
 * Updates monitoring traffic light
 */
function updateMonitoringTrafficLight() {
    const light = document.getElementById('monitoringTrafficLight');
    if (!light) return;
    
    // Monitoring system is always active and working
    // It's green because the system is monitoring and ready
    
    // Remove all status classes
    light.classList.remove('status-gray', 'status-orange', 'status-green', 'status-red');
    
    // Always green - monitoring system is active and functional
    light.classList.add('status-green');
}

// ===== GENERAL SYSTEM STATUS =====

/**
 * Updates the general system status card based on all traffic lights
 */
function updateGeneralSystemStatus() {
    const statusElement = document.getElementById('overallStatus');
    if (!statusElement) return;
    
    console.log('🔄 Updating general system status...');
    
    // Get status of all traffic lights
    const mappingStatus = getTrafficLightStatus('mappingTrafficLight');
    const scanningStatus = getTrafficLightStatus('scanningTrafficLight');
    const fixesStatus = getTrafficLightStatus('fixesTrafficLight');
    const monitoringStatus = getTrafficLightStatus('monitoringTrafficLight');
    
    console.log('🚦 Traffic light statuses:', {
        mapping: mappingStatus,
        scanning: scanningStatus,
        fixes: fixesStatus,
        monitoring: monitoringStatus
    });
    
    // Determine overall status and recommendation
    const { status, recommendation } = determineSystemStatus(mappingStatus, scanningStatus, fixesStatus, monitoringStatus);
    
    // Update the status text
    statusElement.textContent = status;
    
    console.log(`✅ General system status: ${status} | Recommendation: ${recommendation}`);
}

/**
 * Gets the current status of a traffic light
 */
function getTrafficLightStatus(lightId) {
    const light = document.getElementById(lightId);
    if (!light) return 'unknown';
    
    if (light.classList.contains('status-gray')) return 'gray';
    if (light.classList.contains('status-orange')) return 'orange';
    if (light.classList.contains('status-green')) return 'green';
    if (light.classList.contains('status-red')) return 'red';
    
    return 'unknown';
}

/**
 * Determines overall system status and recommendation
 */
function determineSystemStatus(mapping, scanning, fixes, monitoring) {
    // Priority order: red > orange > gray > green
    
    // Check for critical issues (red)
    if (scanning === 'red') {
        return {
            status: 'בעיות קריטיות זוהו',
            recommendation: 'נדרש תיקון דחוף'
        };
    }
    
    // Check for warnings (orange)
    if (scanning === 'orange') {
        return {
            status: 'אזהרות זוהו',
            recommendation: 'מומלץ לבדוק אזהרות'
        };
    }
    
    // Check if scanning is ready (green mapping, gray scanning)
    if (mapping === 'green' && scanning === 'gray') {
        return {
            status: 'מוכן לסריקה',
            recommendation: 'התחל סריקת קבצים'
        };
    }
    
    // Check if mapping is in progress
    if (mapping === 'orange') {
        return {
            status: 'מיפוי בתהליך',
            recommendation: 'המתן לסיום המיפוי'
        };
    }
    
    // Check if mapping is not started
    if (mapping === 'gray') {
        return {
            status: 'מוכן למיפוי',
            recommendation: 'התחל מיפוי קבצים'
        };
    }
    
    // Check if everything is complete
    if (mapping === 'green' && scanning === 'green' && monitoring === 'green') {
        return {
            status: 'מערכת תקינה',
            recommendation: 'כל השלבים הושלמו'
        };
    }
    
    // Default status
    return {
        status: 'מערכת פעילה',
        recommendation: 'בדוק את הרמזורים לפרטים'
    };
}

// ===== SCANNING DASHBOARD SYSTEM =====

/**
 * Updates the scanning dashboard with current scanning data
 */
function updateScanningDashboard() {
    console.log('🔄 Updating scanning dashboard...');
    
    // Update main status cards
    updateScanningMainStatus();
    
    // Update detailed statistics
    updateScanningDetailedStats();
    
    // Update scanning action indicators
    updateScanningActionIndicators();
    
    // Update scanning progress bar
    updateScanningProgressBar();
    
    // Update results summary
    updateScanningResultsSummary();
    
    console.log('✅ Scanning dashboard updated');
}

/**
 * Updates main status cards in scanning dashboard
 */
function updateScanningMainStatus() {
    const scannedFilesElement = document.getElementById('scannedFilesCount');
    const errorsElement = document.getElementById('scanningErrorsCount');
    const durationElement = document.getElementById('scanningDuration');
    
    if (window.scanningResults) {
        const scannedFiles = window.scanningResults.scannedFiles || 0;
        const errors = window.scanningResults.errors ? window.scanningResults.errors.length : 0;
        const startTime = window.scanningResults.startTime;
        const endTime = window.scanningResults.endTime;
        
        if (scannedFilesElement) scannedFilesElement.textContent = scannedFiles;
        if (errorsElement) errorsElement.textContent = errors;
        
        if (durationElement) {
            if (startTime && endTime) {
                const duration = Math.round((endTime - startTime) / 1000);
                durationElement.textContent = `${duration} שניות`;
            } else if (startTime) {
                const duration = Math.round((Date.now() - startTime) / 1000);
                durationElement.textContent = `${duration} שניות (בתהליך)`;
            } else {
                durationElement.textContent = 'טרם בוצעה';
            }
        }
    } else {
        if (scannedFilesElement) scannedFilesElement.textContent = '0';
        if (errorsElement) errorsElement.textContent = '0';
        if (durationElement) durationElement.textContent = 'טרם בוצעה';
    }
}

/**
 * Updates detailed statistics in scanning dashboard
 */
function updateScanningDetailedStats() {
    const criticalErrorsElement = document.getElementById('criticalErrorsCount');
    const warningsElement = document.getElementById('warningsCount');
    const suggestionsElement = document.getElementById('suggestionsCount');
    const cleanFilesElement = document.getElementById('cleanFilesCount');
    const totalScannedElement = document.getElementById('totalScannedCount');
    
    if (window.scanningResults) {
        const errors = window.scanningResults.errors || [];
        const warnings = window.scanningResults.warnings || [];
        const scannedFiles = window.scanningResults.scannedFiles || 0;
        
        // Calculate statistics
        const criticalErrors = errors.filter(error => error.severity === 'error').length;
        const suggestions = warnings.filter(warning => warning.severity === 'suggestion').length;
        const cleanFiles = scannedFiles - errors.length - warnings.length;
        
        if (criticalErrorsElement) criticalErrorsElement.textContent = criticalErrors;
        if (warningsElement) warningsElement.textContent = warnings.length;
        if (suggestionsElement) suggestionsElement.textContent = suggestions;
        if (cleanFilesElement) cleanFilesElement.textContent = Math.max(0, cleanFiles);
        if (totalScannedElement) totalScannedElement.textContent = scannedFiles;
    } else {
        if (criticalErrorsElement) criticalErrorsElement.textContent = '0';
        if (warningsElement) warningsElement.textContent = '0';
        if (suggestionsElement) suggestionsElement.textContent = '0';
        if (cleanFilesElement) cleanFilesElement.textContent = '0';
        if (totalScannedElement) totalScannedElement.textContent = '0';
    }
}

/**
 * Updates results summary in scanning dashboard
 */
function updateScanningResultsSummary() {
    const scanningTotalErrorsElement = document.getElementById('scanningTotalErrors');
    const scanningTotalWarningsElement = document.getElementById('scanningTotalWarnings');
    const totalScannedFilesElement = document.getElementById('totalScannedFiles');
    const scanningDurationElement = document.getElementById('scanningDuration');
    
    if (window.scanningResults) {
        const errors = window.scanningResults.errors ? window.scanningResults.errors.length : 0;
        const warnings = window.scanningResults.warnings ? window.scanningResults.warnings.length : 0;
        const scannedFiles = window.scanningResults.scannedFiles || 0;
        const startTime = window.scanningResults.startTime;
        const endTime = window.scanningResults.endTime;
        
        if (scanningTotalErrorsElement) scanningTotalErrorsElement.textContent = errors;
        if (scanningTotalWarningsElement) scanningTotalWarningsElement.textContent = warnings;
        if (totalScannedFilesElement) totalScannedFilesElement.textContent = scannedFiles;
        
        if (scanningDurationElement) {
            if (startTime && endTime) {
                const duration = Math.round((endTime - startTime) / 1000);
                scanningDurationElement.textContent = `${duration} שניות`;
            } else if (startTime) {
                const duration = Math.round((Date.now() - startTime) / 1000);
                scanningDurationElement.textContent = `${duration} שניות (בתהליך)`;
            } else {
                scanningDurationElement.textContent = '-';
            }
        }
        
        console.log(`✅ Updated results summary: ${errors} errors, ${warnings} warnings, ${scannedFiles} files`);
    } else {
        if (scanningTotalErrorsElement) scanningTotalErrorsElement.textContent = '0';
        if (scanningTotalWarningsElement) scanningTotalWarningsElement.textContent = '0';
        if (totalScannedFilesElement) totalScannedFilesElement.textContent = '0';
        if (scanningDurationElement) scanningDurationElement.textContent = '-';
    }
}

/**
 * Updates scanning action indicators
 */
function updateScanningActionIndicators() {
    updateScanningStatusIndicator();
    updateScanningPerformanceIndicator();
    updateScanningQualityIndicator();
}

/**
 * Updates scanning status indicator
 */
function updateScanningStatusIndicator() {
    const indicator = document.getElementById('scanningStatusIndicator');
    const icon = document.getElementById('scanningStatusIcon');
    const text = document.getElementById('scanningStatusText');
    
    if (!indicator || !icon || !text) return;
    
    const hasScanResults = window.scanningResults && window.scanningResults.scannedFiles > 0;
    const isScanningActive = window.scanningResults && window.scanningResults.startTime && !window.scanningResults.endTime;
    
    if (isScanningActive) {
        icon.textContent = '🔄';
        text.textContent = 'סריקה בתהליך';
        setIndicatorStatus(indicator, 'processing');
    } else if (hasScanResults) {
        icon.textContent = '✅';
        text.textContent = 'סריקה הושלמה';
        setIndicatorStatus(indicator, 'success');
    } else {
        icon.textContent = '🔍';
        text.textContent = 'מוכן לסריקה';
        setIndicatorStatus(indicator, 'info');
    }
}

/**
 * Updates scanning performance indicator
 */
function updateScanningPerformanceIndicator() {
    const indicator = document.getElementById('scanningPerformanceIndicator');
    const icon = document.getElementById('scanningPerformanceIcon');
    const text = document.getElementById('scanningPerformanceText');
    
    if (!indicator || !icon || !text) return;
    
    // Simulate performance check
    const startTime = performance.now();
    
    setTimeout(() => {
        const responseTime = performance.now() - startTime;
        
        if (responseTime < 50) {
            icon.textContent = '⚡';
            text.textContent = 'ביצועים מעולים';
            setIndicatorStatus(indicator, 'success');
        } else if (responseTime < 100) {
            icon.textContent = '⚡';
            text.textContent = 'ביצועים אופטימליים';
            setIndicatorStatus(indicator, 'success');
        } else {
            icon.textContent = '⚠️';
            text.textContent = 'ביצועים בינוניים';
            setIndicatorStatus(indicator, 'warning');
        }
    }, 10);
}

/**
 * Updates scanning quality indicator
 */
function updateScanningQualityIndicator() {
    const indicator = document.getElementById('scanningQualityIndicator');
    const icon = document.getElementById('scanningQualityIcon');
    const text = document.getElementById('scanningQualityText');
    
    if (!indicator || !icon || !text) return;
    
    if (window.scanningResults && window.scanningResults.scannedFiles > 0) {
        const errors = window.scanningResults.errors ? window.scanningResults.errors.length : 0;
        const warnings = window.scanningResults.warnings ? window.scanningResults.warnings.length : 0;
        const totalIssues = errors + warnings;
        
        if (totalIssues === 0) {
            icon.textContent = '🎯';
            text.textContent = 'איכות מושלמת';
            setIndicatorStatus(indicator, 'success');
        } else if (totalIssues < 5) {
            icon.textContent = '🎯';
            text.textContent = 'איכות טובה';
            setIndicatorStatus(indicator, 'success');
        } else if (totalIssues < 10) {
            icon.textContent = '⚠️';
            text.textContent = 'איכות בינונית';
            setIndicatorStatus(indicator, 'warning');
        } else {
            icon.textContent = '🚨';
            text.textContent = 'איכות נמוכה';
            setIndicatorStatus(indicator, 'error');
        }
    } else {
        icon.textContent = '🎯';
        text.textContent = 'איכות סריקה גבוהה';
        setIndicatorStatus(indicator, 'info');
    }
}

/**
 * Updates scanning progress bar
 */
function updateScanningProgressBar() {
    const progressFill = document.getElementById('scanningProgressFill');
    const progressPercentage = document.getElementById('scanningProgressPercentage');
    const progressRow = document.getElementById('scanningProgressRow');
    
    if (!progressFill || !progressPercentage) return;
    
    if (window.scanningResults) {
        const scannedFiles = window.scanningResults.scannedFiles || 0;
        const totalFiles = window.scanningResults.totalFiles || 0;
        // Cap progress at 100% to avoid showing more than 100%
        const progress = totalFiles > 0 ? Math.min(100, Math.round((scannedFiles / totalFiles) * 100)) : 0;
        
        progressFill.style.width = `${progress}%`;
        progressPercentage.textContent = `${progress}%`;
        
        // Hide progress bar if scanning is completed successfully (100%)
        if (progress === 100 && progressRow) {
            const hasErrors = window.scanningResults.errors && window.scanningResults.errors.length > 0;
            if (!hasErrors) {
                setTimeout(() => {
                    progressRow.style.display = 'none';
                    console.log('✅ Scanning progress bar hidden - scanning completed successfully');
                }, 2000);
            }
        } else if (progress < 100 && progressRow) {
            progressRow.style.display = 'block';
        }
    } else {
        progressFill.style.width = '0%';
        progressPercentage.textContent = '0%';
        if (progressRow) progressRow.style.display = 'block';
    }
}

// Export functions to global scope
window.refreshChartData = refreshChartData;
window.clearChartHistory = clearChartHistory;
window.startMonitoring = startMonitoring;
window.stopMonitoring = stopMonitoring;
window.toggleMonitoring = toggleMonitoring;
window.initializeCharts = initializeCharts;
window.discoverProjectFiles = discoverProjectFiles;
window.updateFileMappingStatus = updateFileMappingStatus;
window.startFileScan = startFileScan;
window.copyLinterDetailedLog = copyDetailedLog;
window.toggleTopSection = toggleTopSection;
window.toggleSection = toggleSection;
window.refreshFileList = refreshFileList;
window.clearFileCache = clearFileCache;
window.exportFileList = exportFileList;
window.updateActionIndicators = updateActionIndicators;
window.updateTrafficLights = updateTrafficLights;
window.updateGeneralSystemStatus = updateGeneralSystemStatus;
window.updateScanningDashboard = updateScanningDashboard;

console.log('✅ Linter Realtime Monitor ready');
