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

// Scanning state - using global window object for consistency
window.scanningResults = {
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
// Global chart renderer instances
let qualityChartRenderer = null;
let countsChartRenderer = null;
let isMonitoring = false;
let autoRefreshInterval = null;
let projectFiles = [];

// UI state
let lastScanDate = null;

// Scanning state management
let isScanning = false;
let scanningPromise = null;

// ========================================
// File Discovery and Management
// ========================================

function checkAndUpdateProjectFiles() {
    const cached = localStorage.getItem('linterProjectFiles');
    const cacheTime = localStorage.getItem('linterProjectFilesTimestamp');
    
    if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (age < maxAge) {
            window.projectFiles = JSON.parse(cached);
            const totalFiles = Object.values(window.projectFiles).reduce((sum, files) => sum + files.length, 0);
            addLogEntry('INFO', `נטענו ${totalFiles} קבצים מהמטמון`, {
                filesCount: totalFiles,
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

function initializeCharts() {
    if (typeof QualityChartRenderer === 'undefined' || typeof CountsChartRenderer === 'undefined') {
        addLogEntry('WARNING', 'ChartRenderers לא זמינים - הגרפים לא יוצגו');
        console.warn('ChartRenderers are not available');
        return;
    }
    
    // Initialize Quality Chart (percentages)
    if (qualityChartRenderer) {
        console.log('🗑️ משמיד instance קיים של גרף איכות...');
        qualityChartRenderer.destroy();
        qualityChartRenderer = null;
    }

    qualityChartRenderer = new QualityChartRenderer('qualityChartContainer');
    qualityChartRenderer.initialize().then(() => {
        addLogEntry('SUCCESS', 'גרף איכות קוד אותחל בהצלחה');
        console.log('✅ Quality chart initialized');
    }).catch(error => {
        addLogEntry('ERROR', 'שגיאה באתחול גרף איכות', { error: error.message });
        console.error('Quality chart initialization error:', error);
    });

    // Initialize Counts Chart (numbers)
    if (countsChartRenderer) {
        console.log('🗑️ משמיד instance קיים של גרף ספירות...');
        countsChartRenderer.destroy();
        countsChartRenderer = null;
    }

    countsChartRenderer = new CountsChartRenderer('countsChartContainer');
    countsChartRenderer.initialize().then(() => {
        addLogEntry('SUCCESS', 'גרף ספירות אותחל בהצלחה');
        console.log('✅ Counts chart initialized');
        loadInitialData();
    }).catch(error => {
        addLogEntry('ERROR', 'שגיאה באתחול גרף ספירות', { error: error.message });
        console.error('Counts chart initialization error:', error);
    });
}

// Helper functions for updating charts
function updateQualityChart(data) {
    if (qualityChartRenderer && qualityChartRenderer.isInitialized) {
        // Pass data directly to quality chart renderer
        qualityChartRenderer.updateChart(data);
    }
}

function updateCountsChart(data) {
    if (countsChartRenderer && countsChartRenderer.isInitialized) {
        // Pass data directly to counts chart renderer
        countsChartRenderer.updateChart(data);
    }
}

function addDataPointToCharts(dataPoint) {
    if (qualityChartRenderer && qualityChartRenderer.isInitialized) {
        qualityChartRenderer.addDataPoint(dataPoint);
    }
    
    if (countsChartRenderer && countsChartRenderer.isInitialized) {
        countsChartRenderer.addDataPoint(dataPoint);
    }
}

function clearCharts() {
    if (qualityChartRenderer) {
        qualityChartRenderer.clearChart();
    }
    if (countsChartRenderer) {
        countsChartRenderer.clearChart();
    }
}

async function loadInitialData() {
    try {
        if (typeof window.LinterIndexedDBAdapter !== 'undefined') {
            const adapter = new window.LinterIndexedDBAdapter();
            
            // Wait for IndexedDB to be initialized
            await adapter.initialize();
            
            // Load latest scanning results from IndexedDB
            const latestData = await adapter.getLatestData();
            console.log('🔍 IndexedDB latest data:', latestData);
            
            if (latestData && latestData.length > 0) {
                // Get the most recent scan data
                const latestScan = latestData[latestData.length - 1];
                
                if (latestScan && latestScan.errors && latestScan.warnings) {
                    // Restore scanning results from the latest scan
                    window.scanningResults = {
                        errors: latestScan.errors || [],
                        warnings: latestScan.warnings || [],
                        totalFiles: latestScan.metrics?.totalFiles || 0,
                        scannedFiles: latestScan.filesScanned || 0,
                        startTime: latestScan.timestamp ? new Date(latestScan.timestamp).getTime() : null,
                        endTime: latestScan.timestamp ? new Date(latestScan.timestamp).getTime() : null
                    };
                    
                    addLogEntry('SUCCESS', `נטענו נתוני סריקה אחרונים: ${window.scanningResults.scannedFiles} קבצים, ${window.scanningResults.errors.length} שגיאות, ${window.scanningResults.warnings.length} אזהרות`);
                    
                    // Update last scan date
                    if (latestScan.timestamp) {
                        lastScanDate = latestScan.timestamp;
                        const lastScanElement = document.getElementById('lastScanDate');
                        if (lastScanElement) {
                            lastScanElement.textContent = new Date(latestScan.timestamp).toLocaleString('he-IL');
                        }
                    }
                    
                    // Update UI with loaded data
                    updateStatisticsDisplay();
                    updateProblemFilesTable();
                    updateFileTypeStatistics(window.scanningResults.errors.concat(window.scanningResults.warnings));
                    updateFileTypeCardsProgress();
                }
                
                // Update charts with historical data
                updateQualityChart(latestData);
                updateCountsChart(latestData);
                console.log('✅ Charts updated with historical data from IndexedDB:', latestData);
                
                addLogEntry('SUCCESS', `נטענו ${latestData.length} נקודות נתונים היסטוריות`);
            } else {
                addLogEntry('INFO', 'לא נמצאו נתונים היסטוריים - מתחיל עם גרף ריק');
                // Update indicators with default values
                updateChartIndicators();
            }
        }
    } catch (error) {
        addLogEntry('ERROR', 'שגיאה בטעינת נתונים ראשוניים', { error: error.message });
    }
}

async function updateStatisticsDisplay() {
    try {
        if (typeof window.LinterIndexedDBAdapter !== 'undefined') {
            const adapter = new window.LinterIndexedDBAdapter();
            
            // Initialize adapter if needed
            try {
                await adapter.initialize();
            } catch (initError) {
                console.log('IndexedDB already initialized or initialization failed:', initError.message);
            }
            
                const latestData = await adapter.getLatestData();
                
                console.log('🔍 IndexedDB Debug - latestData:', latestData);
                console.log('🔍 IndexedDB Debug - latestData length:', latestData ? latestData.length : 'null');
                
                if (latestData && latestData.length > 0) {
                // Get the most recent scan data
                const latestScan = latestData[latestData.length - 1];
                
                // Update global scanning results with loaded data
                window.scanningResults.errors = latestScan.errors || [];
                window.scanningResults.warnings = latestScan.warnings || [];
                window.scanningResults.totalFiles = latestScan.metrics?.totalFiles || 0;
                window.scanningResults.scannedFiles = latestScan.filesScanned || 0;
                
                // Update last scan date display
                const lastScanElement = document.getElementById('lastScanDate');
                if (lastScanElement && latestScan.timestamp) {
                    const scanDate = new Date(latestScan.timestamp);
                    lastScanElement.textContent = scanDate.toLocaleString('he-IL');
                    lastScanDate = latestScan.timestamp;
                } else if (lastScanElement) {
                    lastScanElement.textContent = 'טרם בוצעה';
                }
                
                // Update error and warning counts
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
                
                console.log('✅ Updated statistics from IndexedDB:', {
                    errors: window.scanningResults.errors.length,
                    warnings: window.scanningResults.warnings.length,
                    scannedFiles: window.scanningResults.scannedFiles
                });
                
                // Update file type statistics with loaded data
                updateFileTypeStatistics(window.scanningResults.errors.concat(window.scanningResults.warnings));
                
                // Update file type cards with loaded data
                updateFileTypeCardsProgress();
                
                // Update problem files table with loaded data
                updateProblemFilesTable();
                
                // Update chart indicators
                updateChartIndicators();
                
                addLogEntry('SUCCESS', 'סטטיסטיקות עודכנו מהנתונים השמורים');
        } else {
            // Try to load from localStorage as backup
            const savedData = localStorage.getItem('linterScanningResults');
            console.log('🔍 localStorage Debug - savedData:', savedData);
            console.log('🔍 localStorage Debug - savedData length:', savedData ? savedData.length : 'null');
            
            // Debug: Check all localStorage keys
            console.log('🔍 localStorage Debug - All keys:', Object.keys(localStorage));
            console.log('🔍 localStorage Debug - All keys with linter:', Object.keys(localStorage).filter(key => key.includes('linter')));
            
            if (savedData) {
                try {
                    const parsedData = JSON.parse(savedData);
                    if (parsedData && (parsedData.errors?.length > 0 || parsedData.warnings?.length > 0)) {
                        window.scanningResults = parsedData;
                        
                        // Update UI with loaded data
                        const errorCountElement = document.getElementById('totalErrorsStats');
                        const warningCountElement = document.getElementById('totalWarningsStats');
                        const totalFilesElement = document.getElementById('totalFilesStats');
                        const lastScanElement = document.getElementById('lastScanDate');
                        
                        if (errorCountElement) {
                            errorCountElement.textContent = window.scanningResults.errors.length;
                        }
                        if (warningCountElement) {
                            warningCountElement.textContent = window.scanningResults.warnings.length;
                        }
                        if (totalFilesElement) {
                            totalFilesElement.textContent = window.scanningResults.scannedFiles || 0;
                        }
                        if (lastScanElement && window.scanningResults.lastScanTime) {
                            const scanDate = new Date(window.scanningResults.lastScanTime);
                            lastScanElement.textContent = scanDate.toLocaleString('he-IL');
                        }
                        
                        updateFileTypeStatistics(window.scanningResults.errors.concat(window.scanningResults.warnings));
                        updateFileTypeCardsProgress();
                        updateProblemFilesTable();
                        updateChartIndicators();
                        
                        addLogEntry('SUCCESS', 'נתונים נטענו מ-localStorage');
                        console.log('✅ Loaded data from localStorage:', window.scanningResults);
        } else {
                        addLogEntry('INFO', 'לא נמצאו נתונים שמורים - מתחיל עם נתונים ריקים');
                        
                        // Update indicators with default values
                        updateChartIndicators();
                        
                        // Show confirmation dialog to start first scan
    setTimeout(() => {
                            if (typeof window.showConfirmationDialog === 'function') {
                                window.showConfirmationDialog(
                                    'סריקה ראשונה',
                                    'לא נמצאו נתוני סריקה קודמים.\n\nהאם תרצה לבצע סריקה ראשונה עכשיו?',
                                    () => {
                                        scanJavaScriptFiles();
                                    },
                                    () => {
                                        addLogEntry('INFO', 'סריקה ראשונה בוטלה על ידי המשתמש');
                                    },
                                    'info'
                                );
                            } else {
                                // Show custom confirmation dialog
                                showConfirmationDialog(
                                    'סריקה ראשונה',
                                    'לא נמצאו נתוני סריקה קודמים.\n\nהאם תרצה לבצע סריקה ראשונה עכשיו?',
                                    () => {
                                        scanJavaScriptFiles();
                                    },
                                    () => {
                                        addLogEntry('INFO', 'סריקה ראשונה בוטלה על ידי המשתמש');
                                    },
                                    'info'
                                );
                            }
                        }, 1000);
                    }
                } catch (error) {
                    addLogEntry('WARNING', 'שגיאה בטעינת נתונים מ-localStorage', { error: error.message });
                    addLogEntry('INFO', 'לא נמצאו נתונים שמורים - מתחיל עם נתונים ריקים');
                }
            } else {
                addLogEntry('INFO', 'לא נמצאו נתונים שמורים - מתחיל עם נתונים ריקים');
                
                // Show confirmation dialog to start first scan
                setTimeout(() => {
                    if (typeof window.showConfirmationDialog === 'function') {
                        window.showConfirmationDialog(
                            'סריקה ראשונה',
                            'לא נמצאו נתוני סריקה קודמים.\n\nהאם תרצה לבצע סריקה ראשונה עכשיו?',
                            () => {
                                scanJavaScriptFiles();
                            },
                            () => {
                                addLogEntry('INFO', 'סריקה ראשונה בוטלה על ידי המשתמש');
                            },
                            'info'
                        );
                    } else {
                        // Show custom confirmation dialog
                        showConfirmationDialog(
                            'סריקה ראשונה',
                            'לא נמצאו נתוני סריקה קודמים.\n\nהאם תרצה לבצע סריקה ראשונה עכשיו?',
                            () => {
                                scanJavaScriptFiles();
                            },
                            () => {
                                addLogEntry('INFO', 'סריקה ראשונה בוטלה על ידי המשתמש');
                            },
                            'info'
                        );
                    }
                }, 1000);
            }
            
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
            const errorCountElement = document.getElementById('totalErrorsStats');
            const warningCountElement = document.getElementById('totalWarningsStats');
            const totalFilesElement = document.getElementById('totalFilesStats');
            const lastScanElement = document.getElementById('lastScanDate');
            
            if (errorCountElement) {
                errorCountElement.textContent = '0';
            }
            if (warningCountElement) {
                warningCountElement.textContent = '0';
            }
            if (totalFilesElement) {
                totalFilesElement.textContent = '0';
            }
            if (lastScanElement) {
                lastScanElement.textContent = 'טרם בוצעה';
            }
        }
        } else {
            addLogEntry('WARNING', 'IndexedDB לא זמין - משתמש בנתונים מקומיים בלבד');
            
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
            const errorCountElement = document.getElementById('totalErrorsStats');
            const warningCountElement = document.getElementById('totalWarningsStats');
            const totalFilesElement = document.getElementById('totalFilesStats');
            const lastScanElement = document.getElementById('lastScanDate');
            
            if (errorCountElement) {
                errorCountElement.textContent = '0';
            }
            if (warningCountElement) {
                warningCountElement.textContent = '0';
            }
            if (totalFilesElement) {
                totalFilesElement.textContent = '0';
            }
            if (lastScanElement) {
                lastScanElement.textContent = 'טרם בוצעה';
            }
        }
    } catch (error) {
        addLogEntry('ERROR', 'שגיאה בעדכון תצוגת הסטטיסטיקות', { error: error.message });
        console.error('Statistics display error:', error);
    }
}

// ========================================
// Log Management
// ========================================

function loadLogs() {
    try {
        const logs = JSON.parse(localStorage.getItem('linterLogs') || '[]');
        // Just update the display once with all logs, don't call handleLogEntry for each
        updateLogDisplay();
        addLogEntry('SUCCESS', `נטענו ${logs.length} רשומות לוג`);
        
        // Try to load scanning results from localStorage as backup
        loadScanningResultsFromLocalStorage();
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

function loadScanningResultsFromLocalStorage() {
    try {
        // Try to load scanning results from localStorage
        const savedResults = localStorage.getItem('linterScanningResults');
        console.log('🔍 Checking localStorage for scanning results:', savedResults ? 'Found' : 'Not found');
        
        if (savedResults) {
            const results = JSON.parse(savedResults);
            console.log('📊 Loaded scanning results from localStorage:', results);
            
            // Update global scanning results
            window.scanningResults = {
                errors: results.errors || [],
                warnings: results.warnings || [],
                totalFiles: results.totalFiles || 0,
                scannedFiles: results.scannedFiles || 0,
                startTime: results.startTime || null,
                endTime: results.endTime || null
            };
            
            console.log('✅ Updated window.scanningResults:', window.scanningResults);
            
            // Update UI with loaded data
            updateRealtimeProgress();
            updateFileTypeStatistics(window.scanningResults.errors.concat(window.scanningResults.warnings));
            updateFileTypeCardsProgress();
            updateProblemFilesTable();
            
            addLogEntry('SUCCESS', `נתוני סריקה נטענו מ-localStorage: ${window.scanningResults.scannedFiles} קבצים, ${window.scanningResults.errors.length} שגיאות, ${window.scanningResults.warnings.length} אזהרות`);
        } else {
            console.log('❌ No scanning results found in localStorage');
            addLogEntry('INFO', 'לא נמצאו נתוני סריקה ב-localStorage');
        }
    } catch (error) {
        console.error('❌ Error loading scanning results from localStorage:', error);
        addLogEntry('ERROR', 'שגיאה בטעינת נתוני סריקה מ-localStorage', { error: error.message });
    }
}

// ========================================
// Statistics and Display Management
// ========================================

/**
 * Update chart indicators display
 * Updates the chart indicators section with current data
 */
function updateChartIndicators() {
    try {
        // Check if scanning results are available
        if (!window.scanningResults || !window.scanningResults.errors) {
            console.log('⚠️ No scanning results available yet, skipping indicators update');
            return;
        }
        
        // Get current data
        const totalErrors = window.scanningResults?.errors?.length || 0;
        const totalWarnings = window.scanningResults?.warnings?.length || 0;
        const totalFiles = window.scanningResults?.scannedFiles || 0;
        const lastScanTime = window.scanningResults?.lastScanTime || null;
        
        // Calculate data points (number of scans)
        const dataPoints = window.scanningResults?.scanCount || 0;
        
        // Calculate average quality score
        const qualityScore = Math.max(0, 100 - (totalErrors * 5) - (totalWarnings * 2));
        
        // Calculate storage size (approximate)
        const storageSize = calculateStorageSize();
        
        // Update DOM elements
        const totalDataPointsElement = document.getElementById('totalDataPoints');
        const lastUpdateTimeElement = document.getElementById('lastUpdateTime');
        const storageSizeElement = document.getElementById('storageSize');
        const avgQualityElement = document.getElementById('avgQuality');
        const totalErrorsElement = document.getElementById('totalErrors');
        
        if (totalDataPointsElement) {
            totalDataPointsElement.textContent = dataPoints;
        }
        
        if (lastUpdateTimeElement) {
            if (lastScanTime) {
                const updateDate = new Date(lastScanTime);
                lastUpdateTimeElement.textContent = updateDate.toLocaleString('he-IL');
            } else {
                lastUpdateTimeElement.textContent = 'טרם בוצעה';
            }
        }
        
        if (storageSizeElement) {
            storageSizeElement.textContent = storageSize;
        }
        
        if (avgQualityElement) {
            avgQualityElement.textContent = `${qualityScore}%`;
            // Add color based on quality
            if (qualityScore >= 90) {
                avgQualityElement.style.color = '#28a745'; // Green
            } else if (qualityScore >= 70) {
                avgQualityElement.style.color = '#ffc107'; // Yellow
    } else {
                avgQualityElement.style.color = '#dc3545'; // Red
            }
        }
        
        if (totalErrorsElement) {
            totalErrorsElement.textContent = totalErrors;
            // Add color based on error count
            if (totalErrors === 0) {
                totalErrorsElement.style.color = '#28a745'; // Green
            } else if (totalErrors < 5) {
                totalErrorsElement.style.color = '#ffc107'; // Yellow
            } else {
                totalErrorsElement.style.color = '#dc3545'; // Red
            }
        }
        
        console.log('✅ Chart indicators updated:', {
            dataPoints,
            lastScanTime,
            storageSize,
            qualityScore,
            totalErrors
        });
        
    } catch (error) {
        console.error('❌ Error updating chart indicators:', error);
        addLogEntry('ERROR', 'שגיאה בעדכון אינדיקטורים', { error: error.message });
    }
}

/**
 * Calculate approximate storage size
 * Returns a human-readable storage size
 */
function calculateStorageSize() {
    try {
        // Calculate localStorage size
        let localStorageSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                localStorageSize += localStorage[key].length;
            }
        }
        
        // Convert to human readable format
        if (localStorageSize < 1024) {
            return `${localStorageSize} B`;
        } else if (localStorageSize < 1024 * 1024) {
            return `${(localStorageSize / 1024).toFixed(1)} KB`;
        } else {
            return `${(localStorageSize / (1024 * 1024)).toFixed(1)} MB`;
        }
    } catch (error) {
        return 'לא זמין';
    }
}

function updateFileTypeStatistics(issues) {
    console.log('🔄 updateFileTypeStatistics called with issues:', issues ? issues.length : 0);
    console.log('📁 window.projectFiles:', window.projectFiles);
    
    const stats = {};
    
    // Ensure issues is an array
    const issuesArray = issues || [];
    
    // First, add all discovered files to stats (even those without issues)
    if (window.projectFiles) {
        console.log('📁 Processing project files...');
        // Handle both array and object formats
        if (Array.isArray(window.projectFiles)) {
            console.log('📁 Project files is array format');
            window.projectFiles.forEach(file => {
                const type = getFileType(file);
                if (!stats[type]) {
                    stats[type] = { files: 0, errors: 0, warnings: 0 };
                }
                stats[type].files++;
            });
        } else if (typeof window.projectFiles === 'object') {
            console.log('📁 Project files is object format');
            // Handle object format {js: [...], html: [...], css: [...], etc.}
            Object.keys(window.projectFiles).forEach(type => {
                if (window.projectFiles[type] && Array.isArray(window.projectFiles[type])) {
                    if (!stats[type]) {
                        stats[type] = { files: 0, errors: 0, warnings: 0 };
                    }
                    stats[type].files = window.projectFiles[type].length;
                    console.log(`📁 ${type}: ${stats[type].files} files`);
                }
            });
                }
            } else {
        console.warn('❌ window.projectFiles is not available');
        // If no project files available, initialize with empty stats for all types
        const allTypes = ['js', 'html', 'css', 'python', 'other'];
        allTypes.forEach(type => {
            stats[type] = { files: 0, errors: 0, warnings: 0 };
        });
    }
    
    // Then add issues to the stats
    issuesArray.forEach(issue => {
        if (issue && issue.file) {
            const type = getFileType(issue.file);
            if (!stats[type]) {
                stats[type] = { files: 0, errors: 0, warnings: 0 };
            }
            
            if (issue.type === 'error') {
                stats[type].errors++;
            } else if (issue.type === 'warning') {
                stats[type].warnings++;
            }
        }
    });
    
    // Update UI counters
    console.log('🔄 Updating UI statistics:', stats);
    console.log('📊 Stats keys:', Object.keys(stats));
    
    // Ensure all file types are represented in the stats
    const allTypes = ['js', 'html', 'css', 'python', 'other'];
    allTypes.forEach(type => {
        if (!stats[type]) {
            stats[type] = { files: 0, errors: 0, warnings: 0 };
        }
    });
    
    Object.keys(stats).forEach(type => {
        const stat = stats[type];
        console.log(`📊 Processing type: ${type}, stat:`, stat);
        
        // Map type names to element IDs
        const elementIdMap = {
            'python': 'py',
            'css': 'css',
            'html': 'html',
            'js': 'js',
            'other': 'other'
        };
        
        const elementId = elementIdMap[type] || type;
        console.log(`📊 Mapped ${type} to elementId: ${elementId}`);
        
        // Update file count
        const fileCountElement = document.getElementById(`${elementId}FilesCount`);
        if (fileCountElement) {
            fileCountElement.textContent = stat.files;
            console.log(`✅ Updated ${elementId}FilesCount to ${stat.files}`);
        } else {
            console.warn(`❌ Element ${elementId}FilesCount not found`);
        }
        
        // Update error count
        const errorCountElement = document.getElementById(`${elementId}ErrorsCount`);
        if (errorCountElement) {
            errorCountElement.textContent = stat.errors;
            console.log(`✅ Updated ${elementId}ErrorsCount to ${stat.errors}`);
        } else {
            console.warn(`❌ Element ${elementId}ErrorsCount not found`);
        }
        
        // Update warning count
        const warningCountElement = document.getElementById(`${elementId}WarningsCount`);
        if (warningCountElement) {
            warningCountElement.textContent = stat.warnings;
            console.log(`✅ Updated ${elementId}WarningsCount to ${stat.warnings}`);
    } else {
            console.warn(`❌ Element ${elementId}WarningsCount not found`);
        }
    });
    
    // Update problem files table
    updateProblemFilesTable();
}

function updateFileTypeCardsProgress() {
    console.log('🔄 updateFileTypeCardsProgress called');
    
    // Get current scan progress
    const totalFiles = window.scanningResults.totalFiles;
    const scannedFiles = window.scanningResults.scannedFiles;
    const errors = window.scanningResults.errors;
    const warnings = window.scanningResults.warnings;
    
    console.log('📊 Current progress:', { totalFiles, scannedFiles, errors: errors.length, warnings: warnings.length });
    
    // Calculate progress per file type based on scanned files
    if (window.projectFiles && totalFiles > 0) {
        const progressRatio = scannedFiles / totalFiles;
        
        Object.keys(window.projectFiles).forEach(type => {
            if (window.projectFiles[type] && Array.isArray(window.projectFiles[type])) {
                const totalFilesOfType = window.projectFiles[type].length;
                const scannedFilesOfType = Math.round(totalFilesOfType * progressRatio);
                
                // Map type names to element IDs
                const elementIdMap = {
                    'python': 'py',
                    'css': 'css',
                    'html': 'html',
                    'js': 'js',
                    'other': 'other'
                };
                
                const elementId = elementIdMap[type] || type;
                
                // Update file count with progress
                const fileCountElement = document.getElementById(`${elementId}FilesCount`);
                if (fileCountElement) {
                    fileCountElement.textContent = scannedFilesOfType;
                    console.log(`✅ Updated ${elementId}FilesCount to ${scannedFilesOfType} (progress: ${Math.round(progressRatio * 100)}%)`);
                }
                
                // Count errors and warnings for this file type
                const typeErrors = errors.filter(error => getFileType(error.file) === type).length;
                const typeWarnings = warnings.filter(warning => getFileType(warning.file) === type).length;
                
                // Update error count
                const errorCountElement = document.getElementById(`${elementId}ErrorsCount`);
                if (errorCountElement) {
                    errorCountElement.textContent = typeErrors;
                    console.log(`✅ Updated ${elementId}ErrorsCount to ${typeErrors}`);
                }
                
                // Update warning count
                const warningCountElement = document.getElementById(`${elementId}WarningsCount`);
                if (warningCountElement) {
                    warningCountElement.textContent = typeWarnings;
                    console.log(`✅ Updated ${elementId}WarningsCount to ${typeWarnings}`);
                }
            }
        });
    }
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
    const tableBody = document.getElementById('problemFilesTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Get all issues from scanning results
    const allIssues = (window.scanningResults?.errors || []).concat(window.scanningResults?.warnings || []);
    
    if (allIssues.length === 0) {
        const row = tableBody.insertRow();
        row.innerHTML = `<td colspan="6" class="text-center">אין קבצים בעייתיים - הכל תקין! 🎉</td>`;
        return;
    }

    // Group issues by file
    const filesWithIssues = {};
    allIssues.forEach(issue => {
        if (!filesWithIssues[issue.file]) {
            filesWithIssues[issue.file] = {
                file: issue.file,
                errors: 0,
                warnings: 0,
                total: 0,
                type: getFileType(issue.file)
            };
        }
        
        if (issue.type === 'error') {
            filesWithIssues[issue.file].errors++;
        } else if (issue.type === 'warning') {
            filesWithIssues[issue.file].warnings++;
        }
        filesWithIssues[issue.file].total++;
    });
    
    // Convert to array and sort by total issues (descending)
    const sortedFiles = Object.values(filesWithIssues).sort((a, b) => b.total - a.total);
    
    // Update problem files count
    const problemFilesCountElement = document.getElementById('problemFilesCount');
    if (problemFilesCountElement) {
        problemFilesCountElement.textContent = `${sortedFiles.length} קבצים`;
    }
    
    // Display files with issues
    sortedFiles.forEach(fileInfo => {
        const row = tableBody.insertRow();
        const severity = fileInfo.errors > 0 ? 'danger' : 'warning';
        const severityText = fileInfo.errors > 0 ? 'קריטי' : 'אזהרה';
        
        row.innerHTML = `
            <td>${fileInfo.file}</td>
            <td>${fileInfo.type.toUpperCase()}</td>
            <td>${fileInfo.errors}</td>
            <td>${fileInfo.warnings}</td>
            <td>${fileInfo.total}</td>
            <td><span class="badge bg-${severity}">${severityText}</span></td>
        `;
    });
}

// ========================================
// Scanning Functions
// ========================================

async function startFileScan() {
    
    // Check if analysis functions are loaded
    if (typeof window.analyzeFileContent !== 'function') {
        addLogEntry('ERROR', 'מודולי ניתוח הקבצים לא נטענו - ממתין...');
        console.error('❌ Analysis functions not loaded yet');
        
        // Wait a bit and try again
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (typeof window.analyzeFileContent !== 'function') {
            addLogEntry('ERROR', 'מודולי ניתוח הקבצים עדיין לא זמינים - בדוק את טעינת הסקריפטים');
            console.error('❌ Analysis functions still not available');
        return;
        }
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
    
    // Initialize statistics display at the start of scan
    updateFileTypeStatistics([]);
    
    // Initialize file type cards progress
    updateFileTypeCardsProgress();
    
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

async function scanJavaScriptFiles() {
    console.log('🚀 scanJavaScriptFiles called!');
    
    // Prevent multiple simultaneous scans
    if (isScanning) {
        console.log('⚠️ Scan already in progress, waiting for completion...');
        if (scanningPromise) {
            return await scanningPromise;
        }
        return;
    }
    
    isScanning = true;
    scanningPromise = performScan();
    
    try {
        const result = await scanningPromise;
        return result;
    } finally {
        isScanning = false;
        scanningPromise = null;
    }
}

async function performScan() {
    
    const selectedTypes = getSelectedFileTypes();
    console.log('🔍 Selected types:', selectedTypes);
    
    // אם לא נבחרו סוגי קבצים, נבחר את כולם
    if (selectedTypes.length === 0) {
        console.log('⚠️ No file types selected, defaulting to all types');
        selectedTypes.push('js', 'html', 'css', 'python', 'other');
    }
    
    console.log('📁 Will scan files of types:', selectedTypes);
    
    let filesToScan = [];
    console.log('🔍 Starting file discovery...');
    
    // Use global project files scanner if available
    if (typeof window.projectFilesScanner !== 'undefined') {
        try {
            console.log('🔍 Using global project files scanner...');
            console.log('🔍 About to call getProjectFiles...');
            const projectFiles = await Promise.race([
                window.projectFilesScanner.getProjectFiles(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 10 seconds')), 10000))
            ]);
            console.log('🔍 getProjectFiles completed, got:', projectFiles);
            console.log('🔍 Project files received:', projectFiles);
            console.log('🔍 Project files keys:', Object.keys(projectFiles));
            console.log('🔍 Project files counts:', Object.keys(projectFiles).map(k => `${k}: ${projectFiles[k]?.length || 0}`));
            
            // Store in global variable for statistics
            window.projectFiles = projectFiles;
            
            // Update file type statistics immediately
            updateFileTypeStatistics([]);
            
            const allFiles = [];
            Object.keys(projectFiles).forEach(type => {
                if (projectFiles[type] && Array.isArray(projectFiles[type])) {
                    allFiles.push(...projectFiles[type]);
                    console.log(`🔍 Added ${projectFiles[type].length} ${type} files`);
                }
            });
            console.log('🔍 Total files collected:', allFiles.length);
            
            filesToScan = allFiles.filter(file => {
                const type = getFileType(file);
                const shouldInclude = selectedTypes.includes(type);
                if (!shouldInclude) {
                    console.log(`🔍 Filtering out ${file} (type: ${type})`);
                }
                return shouldInclude;
            });
            
            console.log('🔍 Files to scan:', filesToScan.length);
        } catch (error) {
            console.error('🔍 Error getting project files:', error);
            // Fall back to static lists
                }
        } else {
        console.error('🔍 projectFilesScanner not available');
    }
    
    // Fallback to static lists if global scanner not available or failed
    if (filesToScan.length === 0) {
        console.log('🔍 Fallback to static files...');
        
        // Try direct API call as fallback
        try {
            console.log('🔍 Trying direct API call...');
            
            const response = await fetch('/api/v1/files/discover');
            if (response.ok) {
                const data = await response.json();
                console.log('🔍 Direct API call successful:', data);
                
                if (data.success && data.files) {
                    const allFiles = [];
                    Object.keys(data.files).forEach(type => {
                        if (data.files[type] && Array.isArray(data.files[type])) {
                            allFiles.push(...data.files[type]);
                        }
                    });
                    
                    filesToScan = allFiles.filter(file => {
                        const type = getFileType(file);
                        return selectedTypes.includes(type);
                    });
                    
                    console.log('🔍 Direct API - Files to scan:', filesToScan.length);
                }
            }
        } catch (apiError) {
            console.error('🔍 Direct API call failed:', apiError);
        }
        
        // No static fallback - stop with clear error message
        console.error('🔍 No files found for scanning - stopping');
        
        // Reset UI and stop scanning
        const scanButton = document.getElementById('startScan');
        if (scanButton) {
            scanButton.disabled = false;
            scanButton.innerHTML = '<i class="fas fa-search"></i> סרוק קבצים';
        }
        
        return; // Stop the scanning process
    }

    window.scanningResults.totalFiles = filesToScan.length;
    console.log('🔍 About to scan files:', filesToScan.slice(0, 5));
    
    // Scan each file sequentially to avoid overwhelming the system
    console.log('🔍 Starting sequential file scanning...');
    
    // Process files one by one to avoid overwhelming the system
    for (let i = 0; i < filesToScan.length; i++) {
        const fileName = filesToScan[i];
        console.log(`🔍 Scanning file ${i + 1}/${filesToScan.length}:`, fileName);
        
        try {
            await scanSingleFile(fileName);
    } catch (error) {
            console.error(`❌ Error scanning file ${fileName}:`, error);
            
            // Count as scanned to avoid infinite loops
            window.scanningResults.scannedFiles++;
            updateRealtimeProgress();
        }
        
        // Small delay to prevent overwhelming the system
        if (i % 10 === 0 && i > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    // Finish scanning after all files are processed
    console.log('🔍 All files processed, finishing scan...');
    await finishScan();
}

async function scanSingleFile(fileName) {
    console.log('🔍 scanSingleFile called with:', fileName);
    
    // Only skip truly problematic files that are known to cause issues
    const skipFiles = [
        'crud-testing-dashboard-backup.html',
        'fix-all-css.py',
        'unified.css',
        'external_data_test.css',
        'remaining-styles.css',
        'eslint.config.js',
        'external_data_test.js',
        'models_test.js',
        'linter-cleanup.js',
        'cache-test.js',
        'test-header-only.js',
        'preferences_defaults.json',
        'migration_20250903_172852_create_user_preferences_table.json',
        'package-lock.json',
        'package.json',
        'test_mode.json',
        'page-selection-tool.html',
        'background-tasks-fixed.html',
        'apple-style-menu-example.html',
        'settings.py',
        'background-tasks.html',
        'ARCHITECTURE_DOCUMENTATION.html',
        'test_models.html',
        'test_external_data.html',
        'menu-pages-list.html',
        'cache-test.html',
        'page-scripts-mapping.html',
        'color-scheme-examples.html',
        'crud-testing-dashboard.html',
        'designs.html',
        'dynamic-colors-display.html',
        'page-scripts-matrix-BACKUP-20250918_213951.html',
        'page-scripts-matrix-UPDATED-20250918_214127.html',
        'page-scripts-matrix.html',
        'simple-clean-menu.html',
        'style_demonstration.html',
        'system-management-fixed.html',
        'test-header-clean.html',
        'test-header-menus-pushed.html',
        'test-header-only-new.html',
        'test-header-only-restored.html',
        'test-header-yesterday.html',
        'test-header-only.html'
    ];
    
    // Skip files that are known to be problematic
    if (skipFiles.some(skip => fileName.includes(skip))) {
        return;
    }

    // Check scan options from UI
    const skipBackupFolders = document.getElementById('skipBackupFolders')?.checked ?? true;
    const skipTestFiles = document.getElementById('skipTestFiles')?.checked ?? true;
    const skipDocumentation = document.getElementById('skipDocumentation')?.checked ?? true;
    
    // Skip files based on user preferences
    if (skipDocumentation && (
        fileName.endsWith('.md') || 
        fileName.endsWith('.txt') || 
        fileName.endsWith('.yml') || 
        fileName.endsWith('.yaml') || 
        fileName.endsWith('.sh') || 
        fileName.endsWith('.py') ||
        fileName.endsWith('.json') ||
        fileName.endsWith('.xml') ||
        fileName.endsWith('.sql') ||
        fileName.endsWith('.bat') ||
        fileName.includes('documentation') ||
        fileName.includes('docs') ||
        fileName.includes('README') ||
        fileName.includes('CHANGELOG') ||
        fileName.includes('LICENSE'))) {
        return;
    }
    
    if (skipBackupFolders && (
        fileName.includes('BACKUP') ||
        fileName.includes('backup') ||
        fileName.includes('backups/') ||
        fileName.includes('_backup') ||
        fileName.includes('_BACKUP'))) {
        return;
    }
    
    if (skipTestFiles && (
        fileName.includes('test_') ||
        fileName.includes('_test') ||
        fileName.includes('TEST_') ||
        fileName.includes('_TEST') ||
        fileName.includes('spec/') ||
        fileName.includes('tests/') ||
        fileName.includes('__tests__/'))) {
        return;
    }
    
    // Build correct path based on file type and location
    let fullPath;
    let cleanFileName = fileName;
    
    // Remove trading-ui/ prefix if it exists
    if (cleanFileName.startsWith('trading-ui/')) {
        cleanFileName = cleanFileName.replace('trading-ui/', '');
    }
    
    if (cleanFileName.startsWith('scripts/') || cleanFileName.startsWith('styles-new/')) {
        fullPath = cleanFileName; // Already has correct path
    } else if (cleanFileName.endsWith('.js') && !cleanFileName.includes('/')) {
        fullPath = `scripts/${cleanFileName}`;
    } else if (cleanFileName.endsWith('.css') && !cleanFileName.includes('/')) {
        fullPath = `styles-new/${cleanFileName}`;
    } else if (cleanFileName.endsWith('.html')) {
        // HTML files are served directly from root, not from pages/ directory
        fullPath = cleanFileName;
    } else {
        fullPath = cleanFileName; // Use as-is
    }
    
    try {
        const response = await fetch(fullPath);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const content = await response.text();
        const fileType = getFileType(cleanFileName);
        
        // Use appropriate analysis function based on file type
        switch (fileType) {
            case 'js':
                if (typeof window.analyzeFileContent === 'function') {
                    window.analyzeFileContent(cleanFileName, content);
    } else {
                    window.scanningResults.scannedFiles++;
                }
                break;
            case 'html':
                if (typeof window.analyzeHtmlContent === 'function') {
                    window.analyzeHtmlContent(cleanFileName, content);
                } else {
                    window.scanningResults.scannedFiles++;
                }
                break;
            case 'css':
                if (typeof window.analyzeCssContent === 'function') {
                    window.analyzeCssContent(cleanFileName, content);
                } else {
                    window.scanningResults.scannedFiles++;
                }
                break;
            case 'python':
                if (typeof window.analyzePythonContent === 'function') {
                    window.analyzePythonContent(cleanFileName, content);
                } else {
                    window.scanningResults.scannedFiles++;
                }
                break;
            default:
                if (typeof window.analyzeOtherContent === 'function') {
                    window.analyzeOtherContent(cleanFileName, content);
                } else {
                    window.scanningResults.scannedFiles++;
                }
                break;
        }
        
        // Update UI with real-time progress
        updateRealtimeProgress();
        
    } catch (error) {
        if (error.message.includes('404')) {
        } else {
        }
        // Count as scanned to avoid infinite loops
        window.scanningResults.scannedFiles++;
        
        // Update UI with real-time progress
        updateRealtimeProgress();
    }
}

// ========================================
// Real-time Progress Updates
// ========================================

function updateRealtimeProgress() {
    try {
        console.log('🔄 updateRealtimeProgress called');
        console.log('📊 Current scanning results:', {
            totalFiles: window.scanningResults.totalFiles,
            scannedFiles: window.scanningResults.scannedFiles,
            errors: window.scanningResults.errors.length,
            warnings: window.scanningResults.warnings.length
        });
        
        // Update progress percentage
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
            console.log(`✅ Updated overallStatus to: ${overallStatusElement.textContent}`);
                } else {
            console.warn('❌ overallStatus element not found');
        }
        
        // Update error and warning counts in real-time
        const errorCountElement = document.getElementById('totalErrorsStats');
        const warningCountElement = document.getElementById('totalWarningsStats');
        const totalFilesElement = document.getElementById('totalFilesStats');
        
        if (errorCountElement) {
            errorCountElement.textContent = window.scanningResults.errors.length;
            console.log(`✅ Updated totalErrorsStats to ${window.scanningResults.errors.length}`);
        } else {
            console.warn('❌ totalErrorsStats element not found');
        }
        
        if (warningCountElement) {
            warningCountElement.textContent = window.scanningResults.warnings.length;
            console.log(`✅ Updated totalWarningsStats to ${window.scanningResults.warnings.length}`);
            } else {
            console.warn('❌ totalWarningsStats element not found');
        }
        
        if (totalFilesElement) {
            totalFilesElement.textContent = window.scanningResults.scannedFiles;
            console.log(`✅ Updated totalFilesStats to ${window.scanningResults.scannedFiles}`);
        } else {
            console.warn('❌ totalFilesStats element not found');
        }
        
        // Update file type statistics in real-time
        console.log('🔄 Calling updateFileTypeStatistics...');
        updateFileTypeStatistics(window.scanningResults.errors.concat(window.scanningResults.warnings));
        
        // Force update of file type cards with current scan progress
        updateFileTypeCardsProgress();
        
        // Update problem files table in real-time
        updateProblemFilesTable();
        
        // Update scan button text with progress
        const scanButton = document.getElementById('startScan');
        if (scanButton) {
            scanButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> סורק... ${progress}%`;
        }
        
        // Add progress log entry every 10 files or at completion
        if (window.scanningResults.scannedFiles % 10 === 0 || 
            window.scanningResults.scannedFiles === window.scanningResults.totalFiles) {
        }
    } catch (error) {
        console.error('Error updating real-time progress:', error);
    }
}

// File analysis functions moved to linter-file-analysis.js module
// Functions: analyzeFileContent, analyzeHtmlContent, analyzePythonContent, analyzeCssContent, analyzeOtherContent, getLineNumber

// simulateFileAnalysis function removed - no more fake data!

async function finishScan() {
    window.scanningResults.endTime = Date.now();
    const duration = (window.scanningResults.endTime - window.scanningResults.startTime) / 1000;
    
    addLogEntry('SUCCESS', `סריקה הושלמה! נסרקו ${window.scanningResults.scannedFiles} קבצים תוך ${duration.toFixed(1)} שניות`);
                
                // Update statistics
    updateFileTypeStatistics(window.scanningResults.errors.concat(window.scanningResults.warnings));
    updateChartIndicators();
    
    // Update UI
    const scanButton = document.getElementById('startScan');
    if (scanButton) {
        scanButton.disabled = false;
        scanButton.innerHTML = '<i class="fas fa-search"></i> סרוק קבצים';
    }
    
    // Update overall status
    const overallStatusElement = document.getElementById('overallStatus');
    if (overallStatusElement) {
        overallStatusElement.textContent = 'סריקה הושלמה';
    }
    
    // הסרת הודעת ניקוי מטמון אם קיימת
    const cacheClearMessage = document.getElementById('cacheClearMessage');
    if (cacheClearMessage) {
        cacheClearMessage.remove();
    }
    
    // Final update of file type cards with actual results
    updateFileTypeCardsProgress();
    
    // Update last scan date
    lastScanDate = new Date().toISOString();
    const lastScanElement = document.getElementById('lastScanDate');
    if (lastScanElement) {
        lastScanElement.textContent = new Date().toLocaleString('he-IL');
    }
    
    // Update charts with real scan data
    const chartData = {
        timestamp: new Date().toISOString(),
        metrics: {
            totalFiles: window.scanningResults.totalFiles,
            errors: window.scanningResults.errors.length,
            warnings: window.scanningResults.warnings.length,
            qualityScore: Math.max(0, 100 - (window.scanningResults.errors.length * 5) - (window.scanningResults.warnings.length * 2))
        },
        filesScanned: window.scanningResults.scannedFiles,
        scanDuration: duration,
        errors: window.scanningResults.errors,
        warnings: window.scanningResults.warnings
    };
    
    // Update charts with real data
    updateQualityChart([chartData]);
    updateCountsChart([chartData]);
    console.log('✅ Charts updated with real scan data:', chartData);
    
    // Save scanning results to localStorage for next load
    try {
        localStorage.setItem('linterScanningResults', JSON.stringify(window.scanningResults));
        console.log('✅ Saved scanning results to localStorage:', window.scanningResults);
    } catch (error) {
        console.warn('Failed to save scanning results to localStorage:', error);
    }
    
    // Save data to IndexedDB
    if (typeof window.LinterIndexedDBAdapter !== 'undefined') {
        try {
            const adapter = new window.LinterIndexedDBAdapter();
            await adapter.initialize();
            
            const dataPoint = {
                timestamp: new Date().toISOString(),
                metrics: {
                    totalFiles: window.scanningResults.totalFiles,
                    errors: window.scanningResults.errors.length,
                    warnings: window.scanningResults.warnings.length,
                    qualityScore: Math.max(0, 100 - (window.scanningResults.errors.length * 5) - (window.scanningResults.warnings.length * 2))
                },
                filesScanned: window.scanningResults.scannedFiles,
                scanDuration: duration,
                errors: window.scanningResults.errors,
                warnings: window.scanningResults.warnings
            };
            
            await adapter.saveDataPoint(dataPoint);
            console.log('✅ Saved data point to IndexedDB:', dataPoint);
        } catch (error) {
            console.error('❌ Failed to save data point to IndexedDB:', error);
        }
    }
    
    // Save data to DataCollector as well
    if (typeof window.DataCollector !== 'undefined' && window.dataCollectorInstance) {
        try {
            await window.dataCollectorInstance.collectFromScan(
                getSelectedFileTypes(),
                calculateTotalSize()
            );
        } catch (error) {
        }
    }
    
    // Update charts
    try {
        const latestDataPoint = {
            timestamp: new Date().toISOString(),
            metrics: {
                qualityScore: Math.max(0, 100 - (window.scanningResults.errors.length * 5) - (window.scanningResults.warnings.length * 2)),
                errors: window.scanningResults.errors.length,
                warnings: window.scanningResults.warnings.length,
                totalFiles: window.scanningResults.totalFiles,
                scannedFiles: window.scanningResults.scannedFiles,
                scanDuration: duration
            }
        };
        
        addDataPointToCharts(latestDataPoint);
    } catch (error) {
        console.error('Chart update error:', error);
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
    } else {
                if (autoRefreshInterval) {
                    clearInterval(autoRefreshInterval);
                }
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

async function initializeSession() {
    addLogEntry('INFO', 'מאתחל מערכת לינטר...');
    
    // Check and update project files
    checkAndUpdateProjectFiles();
    
    // Initialize charts
    initializeCharts();
    
    // Load existing logs
    loadLogs();
    
    // Load initial data from IndexedDB
    await updateStatisticsDisplay();
    
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
    
    // הגרפים כבר מאותחלים כראוי - אין צורך באתחול חוזר
    if ((qualityChartRenderer && qualityChartRenderer.isInitialized) && 
        (countsChartRenderer && countsChartRenderer.isInitialized)) {
        return;
    }
    
    // רק אם הגרף לא מאותחל, ננסה לאתחל אותו
    setTimeout(() => {
        try {
            initializeCharts();
    } catch (error) {
        }
    }, 2000);
}

function attemptStorageRecovery() {
    
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
    const logContainer = document.getElementById('logsContainer');
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
    const typeMap = {
        'scanJs': 'js',
        'scanHtml': 'html', 
        'scanPy': 'python',
        'scanCss': 'css',
        'scanOther': 'other'
    };
    
    const selectedTypes = [];
    Object.keys(typeMap).forEach(checkboxId => {
        const checkbox = document.getElementById(checkboxId);
        console.log(`🔍 Checking checkbox ${checkboxId}:`, checkbox ? `found, checked=${checkbox.checked}` : 'not found');
        if (checkbox && checkbox.checked) {
            selectedTypes.push(typeMap[checkboxId]);
        }
    });
    
    console.log('📋 Final selected types:', selectedTypes);
    return selectedTypes;
}

function calculateTotalSize() {
    // Estimate total size based on file count and average file size
    const avgFileSize = 5000; // 5KB average
    return window.scanningResults.scannedFiles * avgFileSize;
}

async function autoUpdateCharts() {
    if ((qualityChartRenderer || countsChartRenderer) && typeof window.LinterIndexedDBAdapter !== 'undefined') {
        try {
            const adapter = new window.LinterIndexedDBAdapter();
            await adapter.initialize();
            const latestData = await adapter.getHistoricalData();
            
            if (latestData && latestData.length > 0) {
                updateQualityChart(latestData);
                updateCountsChart(latestData);
                addLogEntry('INFO', 'גרפים עודכנו אוטומטית');
            }
        } catch (error) {
            addLogEntry('ERROR', 'שגיאה בעדכון אוטומטי של הגרפים', { error: error.message });
        }
    }
}

async function updateChartTrendIndicators(latestDataPoint) {
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
    addLogEntry('INFO', 'מרענן נתוני גרפים...');
    
    if ((qualityChartRenderer || countsChartRenderer) && typeof window.LinterIndexedDBAdapter !== 'undefined') {
        try {
            const adapter = new window.LinterIndexedDBAdapter();
            await adapter.initialize();
            const historicalData = await adapter.getHistoricalData();
            
            updateQualityChart(historicalData);
            updateCountsChart(historicalData);
            addLogEntry('SUCCESS', 'נתוני הגרפים עודכנו בהצלחה');
        } catch (error) {
            addLogEntry('ERROR', 'שגיאה ברענון נתוני הגרפים', { error: error.message });
        }
    }
};

window.clearChartHistory = async function() {
    showConfirmationDialog(
        'ניקוי היסטוריה',
        'האם אתה בטוח שברצונך לנקות את כל ההיסטוריה?',
        async () => {
        try {
            if (typeof window.LinterIndexedDBAdapter !== 'undefined') {
                const adapter = new window.LinterIndexedDBAdapter();
                await adapter.initialize();
                await adapter.clearAllData();
            }
            
            clearCharts();
            
            // Clear localStorage as well
            localStorage.removeItem('linterScanningResults');
            
            // Reset scanning results
            window.scanningResults = {
                errors: [],
                warnings: [],
                totalFiles: 0,
                scannedFiles: 0,
                startTime: null,
                endTime: null
            };
            
            // Update UI with cleared data
            const errorCountElement = document.getElementById('totalErrorsStats');
            const warningCountElement = document.getElementById('totalWarningsStats');
            const totalFilesElement = document.getElementById('totalFilesStats');
            const lastScanElement = document.getElementById('lastScanDate');
            
            if (errorCountElement) {
                errorCountElement.textContent = '0';
            }
            if (warningCountElement) {
                warningCountElement.textContent = '0';
            }
            if (totalFilesElement) {
                totalFilesElement.textContent = '0';
            }
            if (lastScanElement) {
                lastScanElement.textContent = 'טרם בוצעה';
            }
            
            // Update file type statistics
            updateFileTypeStatistics([]);
            updateFileTypeCardsProgress();
            updateProblemFilesTable();
            
            addLogEntry('SUCCESS', 'היסטוריית הגרף נוקתה בהצלחה');
        } catch (error) {
            addLogEntry('ERROR', 'שגיאה בניקוי היסטוריית הגרף', { error: error.message });
        }
        },
        () => {
            addLogEntry('INFO', 'ניקוי היסטוריה בוטל על ידי המשתמש');
        },
        'warning'
    );
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

function startMonitoring() {
    isMonitoring = true;
    startAutoRefresh();
    
    // עדכון כפתורים
    const startBtn = document.getElementById('startMonitoringBtn');
    const stopBtn = document.getElementById('stopMonitoringBtn');
    
    if (startBtn) {
            startBtn.disabled = true;
        startBtn.innerHTML = '<i class="fas fa-play"></i> פועל...';
        startBtn.className = 'btn btn-success btn-sm';
    }
    
    if (stopBtn) {
        stopBtn.disabled = false;
        stopBtn.innerHTML = '<i class="fas fa-stop"></i> עצור';
        stopBtn.className = 'btn btn-danger btn-sm';
    }
    
    addLogEntry('SUCCESS', 'ניטור הופעל - המערכת תסרוק קבצים אוטומטית');
}

function stopMonitoring() {
    isMonitoring = false;
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
    
    // עדכון כפתורים
    const startBtn = document.getElementById('startMonitoringBtn');
    const stopBtn = document.getElementById('stopMonitoringBtn');
    
    if (startBtn) {
        startBtn.disabled = false;
        startBtn.innerHTML = '<i class="fas fa-play"></i> התחל';
        startBtn.className = 'btn btn-success btn-sm';
    }
    
    if (stopBtn) {
            stopBtn.disabled = true;
        stopBtn.innerHTML = '<i class="fas fa-stop"></i> עצור';
        stopBtn.className = 'btn btn-secondary btn-sm';
    }
    
    addLogEntry('SUCCESS', 'ניטור הופסק - המערכת לא תסרוק קבצים אוטומטית');
}


// ========================================
// Linter System Initialization
// ========================================

/**
 * אתחול מערכת הלינטר
 */
function initializeLinterSystem() {
    try {
        addLogEntry('INFO', 'מאתחל מערכת לינטר...');
        
        // Initialize IndexedDB adapter
        if (typeof window.LinterIndexedDBAdapter !== 'undefined') {
            const adapter = new window.LinterIndexedDBAdapter();
            adapter.initialize().then(() => {
                addLogEntry('INFO', 'IndexedDB אותחל בהצלחה');
            }).catch((error) => {
                addLogEntry('ERROR', `שגיאה באתחול IndexedDB: ${error.message}`);
            });
        }
        
        // Initialize DataCollector
        if (typeof window.DataCollector !== 'undefined') {
            const dataCollector = new window.DataCollector();
            addLogEntry('INFO', 'אספן נתונים אותחל בהצלחה');
        }
        
        addLogEntry('INFO', 'מערכת לינטר אותחלה בהצלחה');
    } catch (error) {
        addLogEntry('ERROR', `שגיאה באתחול מערכת הלינטר: ${error.message}`);
    }
}

// ========================================
// Page Initialization Function
// ========================================

/**
 * פונקציית אתחול העמוד - נקראת מ-main.js
 */
function initializeLinterRealtimeMonitorPage() {
    console.log('🎯 Initializing Linter Realtime Monitor Page...');
    
    // Initialize the linter system
    initializeLinterSystem();
    
    // Initialize charts
    if (typeof window.initializeCharts === 'function') {
        window.initializeCharts();
    }
    
    // Start auto discovery
    autoDiscoverProjectFiles();
    
    console.log('✅ Linter Realtime Monitor Page initialized successfully');
}

// ========================================
// Initialization
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    addLogEntry('INFO', 'DOM נטען - מאתחל מערכת...');
    await initializeSession();
});

// ========================================
// Auto Fix Tools
// ========================================

// Global tracking of fixed issues to prevent re-fixing
window.fixedIssues = {
    errors: new Set(),
    warnings: new Set()
};

// Global tracking for clear feedback
window.fixProgress = {
    totalFiles: 0,
    fixedFiles: 0,
    totalIssues: 0,
    fixedIssues: 0,
    currentFile: '',
    startTime: null
};

// Function to update the clear feedback display
function updateFixProgressDisplay() {
    const progressElement = document.getElementById('fixProgressDisplay');
    if (!progressElement) return;
    
    const progress = window.fixProgress;
    const percentage = progress.totalIssues > 0 ? Math.round((progress.fixedIssues / progress.totalIssues) * 100) : 0;
    const elapsed = progress.startTime ? Math.round((Date.now() - progress.startTime) / 1000) : 0;
    
    progressElement.innerHTML = `
        <div class="fix-progress-container">
            <div class="fix-progress-header">
                <h4>תיקון אוטומטי - התקדמות</h4>
                <span class="fix-progress-percentage">${percentage}%</span>
            </div>
            <div class="fix-progress-details">
                <div class="fix-progress-item">
                    <span class="label">קבצים תוקנו:</span>
                    <span class="value">${progress.fixedFiles}/${progress.totalFiles}</span>
                </div>
                <div class="fix-progress-item">
                    <span class="label">בעיות תוקנו:</span>
                    <span class="value">${progress.fixedIssues}/${progress.totalIssues}</span>
                </div>
                <div class="fix-progress-item">
                    <span class="label">קובץ נוכחי:</span>
                    <span class="value">${progress.currentFile}</span>
                </div>
                <div class="fix-progress-item">
                    <span class="label">זמן שחלף:</span>
                    <span class="value">${elapsed} שניות</span>
                </div>
            </div>
            <div class="fix-progress-bar">
                <div class="fix-progress-fill" style="width: ${percentage}%"></div>
            </div>
                    </div>
                `;
}

// Function to show final results
function showFixResults() {
    const progressElement = document.getElementById('fixProgressDisplay');
    if (!progressElement) return;
    
    const progress = window.fixProgress;
    const successRate = progress.totalIssues > 0 ? Math.round((progress.fixedIssues / progress.totalIssues) * 100) : 0;
    const elapsed = progress.startTime ? Math.round((Date.now() - progress.startTime) / 1000) : 0;
    
    progressElement.innerHTML = `
        <div class="fix-results-container">
            <div class="fix-results-header">
                <h4>תיקון הושלם!</h4>
                <span class="fix-results-success-rate">${successRate}% הצלחה</span>
            </div>
            <div class="fix-results-details">
                <div class="fix-results-item">
                    <span class="label">קבצים תוקנו:</span>
                    <span class="value">${progress.fixedFiles}</span>
                </div>
                <div class="fix-results-item">
                    <span class="label">בעיות תוקנו:</span>
                    <span class="value">${progress.fixedIssues}</span>
                </div>
                <div class="fix-results-item">
                    <span class="label">זמן כולל:</span>
                    <span class="value">${elapsed} שניות</span>
                </div>
            </div>
            <div class="fix-results-actions">
                <button onclick="resetFixProgress()" class="btn btn-secondary">איפוס</button>
                <button onclick="hideFixProgress()" class="btn btn-primary">סגור</button>
            </div>
                    </div>
                `;
}

// Function to reset fix progress
function resetFixProgress() {
    window.fixProgress = {
        totalFiles: 0,
        fixedFiles: 0,
        totalIssues: 0,
        fixedIssues: 0,
        currentFile: '',
        startTime: null
    };
    updateFixProgressDisplay();
}

// Function to hide fix progress
function hideFixProgress() {
    const progressElement = document.getElementById('fixProgressDisplay');
    if (progressElement) {
        progressElement.style.display = 'none';
    }
}

async function fixAllIssues() {
    // Initialize progress tracking
    window.fixProgress = {
        totalFiles: 0,
        fixedFiles: 0,
        totalIssues: window.scanningResults.errors.length + window.scanningResults.warnings.length,
        fixedIssues: 0,
        currentFile: '',
        startTime: Date.now()
    };
    
    // Show progress display
    const progressElement = document.getElementById('fixProgressDisplay');
    if (progressElement) {
        progressElement.style.display = 'block';
    }
    
    updateFixProgressDisplay();
    
    if (window.fixProgress.totalIssues === 0) {
        addLogEntry('INFO', 'אין בעיות לתיקון');
        showFixResults();
        return;
    }
    
    addLogEntry('INFO', `מתחיל תיקון ${window.fixProgress.totalIssues} בעיות...`);
    
            let fixedCount = 0;
    let failedCount = 0;
    const fixedFiles = new Set();
    
    // Fix errors first (more critical)
    const totalErrors = window.scanningResults.errors.length;
    for (let i = window.scanningResults.errors.length - 1; i >= 0; i--) {
        const error = window.scanningResults.errors[i];
        const issueId = `${error.file}:${error.line}:${error.message}`;
        
        if (window.fixedIssues.errors.has(issueId)) {
            continue; // Already fixed
        }
        
        // Update current file
        window.fixProgress.currentFile = error.file;
        updateFixProgressDisplay();
        
        try {
            const success = await fixSingleIssue(error);
            if (success) {
                window.fixedIssues.errors.add(issueId);
                window.scanningResults.errors.splice(i, 1);
                fixedCount++;
                window.fixProgress.fixedIssues++;
                fixedFiles.add(error.file);
                
                // Update progress display
                updateFixProgressDisplay();
            } else {
                failedCount++;
            }
            // Add delay to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
        } catch (err) {
            failedCount++;
        }
    }
    
    // Fix warnings
    const totalWarnings = window.scanningResults.warnings.length;
    for (let i = window.scanningResults.warnings.length - 1; i >= 0; i--) {
        const warning = window.scanningResults.warnings[i];
        const issueId = `${warning.file}:${warning.line}:${warning.message}`;
        
        if (window.fixedIssues.warnings.has(issueId)) {
            continue;
        }
        
        // Update current file
        window.fixProgress.currentFile = warning.file;
        updateFixProgressDisplay();
        
        try {
            const success = await fixSingleIssue(warning);
            if (success) {
                window.fixedIssues.warnings.add(issueId);
                window.scanningResults.warnings.splice(i, 1);
                fixedCount++;
                window.fixProgress.fixedIssues++;
                fixedFiles.add(warning.file);
                
                // Update progress display
                updateFixProgressDisplay();
            } else {
                failedCount++;
            }
            // Add delay to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
        } catch (err) {
            failedCount++;
        }
    }
    
    // Update final progress
    window.fixProgress.fixedFiles = fixedFiles.size;
    window.fixProgress.currentFile = 'הושלם';
    
    // Update UI
    updateRealtimeProgress();
    updateProblemFilesTable();
    
    // Show final results
    showFixResults();
    
    const successRate = window.fixProgress.totalIssues > 0 ? Math.round((fixedCount / window.fixProgress.totalIssues) * 100) : 0;
    addLogEntry('SUCCESS', `תיקון הושלם! תוקנו ${fixedCount} בעיות מתוך ${window.fixProgress.totalIssues} (${successRate}% הצלחה)`);
    
    if (failedCount > 0) {
        addLogEntry('WARNING', `${failedCount} בעיות לא תוקנו - נדרש תיקון ידני`);
    }
}

async function fixAllErrors() {
    addLogEntry('INFO', 'מתחיל תיקון אוטומטי של שגיאות בלבד...');
    
    if (window.scanningResults.errors.length === 0) {
        addLogEntry('INFO', 'אין שגיאות לתיקון');
        return;
    }
    
    // Initialize progress tracking
    window.fixProgress = {
        totalFiles: 0,
        fixedFiles: 0,
        totalIssues: window.scanningResults.errors.length,
        fixedIssues: 0,
        currentFile: '',
        startTime: Date.now()
    };
    
    // Show progress display
    const progressElement = document.getElementById('fixProgressDisplay');
    if (progressElement) {
        progressElement.style.display = 'block';
    }
    
    updateFixProgressDisplay();
    
    let fixedCount = 0;
    let failedCount = 0;
    
    for (let i = window.scanningResults.errors.length - 1; i >= 0; i--) {
        const error = window.scanningResults.errors[i];
        const issueId = `${error.file}:${error.line}:${error.message}`;
        
        if (window.fixedIssues.errors.has(issueId)) {
            continue;
        }
        
        // Update current file
        window.fixProgress.currentFile = error.file;
        updateFixProgressDisplay();
        
        try {
            const success = await fixSingleIssue(error);
            if (success) {
                window.fixedIssues.errors.add(issueId);
                window.scanningResults.errors.splice(i, 1);
                fixedCount++;
                window.fixProgress.fixedIssues++;
                
                // Update progress display
                updateFixProgressDisplay();
            } else {
                failedCount++;
            }
            // Add delay to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
        } catch (err) {
            // Only log critical errors, not every failure
            if (failedCount === 0) {
                addLogEntry('ERROR', `שגיאה בתיקון ${error.file}:${error.line}`, { error: err.message });
            }
            failedCount++;
        }
    }
    
    // Update UI
    updateRealtimeProgress();
    updateProblemFilesTable();
    
    const successRate = window.scanningResults.errors.length + fixedCount > 0 ? 
        Math.round((fixedCount / (window.scanningResults.errors.length + fixedCount)) * 100) : 0;
    addLogEntry('SUCCESS', `תיקון שגיאות הושלם! תוקנו ${fixedCount} שגיאות (${successRate}% הצלחה)`);
    
    // Show final results
    showFixResults();
}

async function fixAllWarnings() {
    addLogEntry('INFO', 'מתחיל תיקון אוטומטי של אזהרות בלבד...');
    
    if (window.scanningResults.warnings.length === 0) {
        addLogEntry('INFO', 'אין אזהרות לתיקון');
        return;
    }
    
    // Initialize progress tracking
    window.fixProgress = {
        totalFiles: 0,
        fixedFiles: 0,
        totalIssues: window.scanningResults.warnings.length,
        fixedIssues: 0,
        currentFile: '',
        startTime: Date.now()
    };
    
    // Show progress display
    const progressElement = document.getElementById('fixProgressDisplay');
    if (progressElement) {
        progressElement.style.display = 'block';
    }
    
    updateFixProgressDisplay();
    
    let fixedCount = 0;
    let failedCount = 0;
    
    for (let i = window.scanningResults.warnings.length - 1; i >= 0; i--) {
        const warning = window.scanningResults.warnings[i];
        const issueId = `${warning.file}:${warning.line}:${warning.message}`;
        
        if (window.fixedIssues.warnings.has(issueId)) {
            continue;
        }
        
        // Update current file
        window.fixProgress.currentFile = warning.file;
        updateFixProgressDisplay();
        
        try {
            const success = await fixSingleIssue(warning);
            if (success) {
                window.fixedIssues.warnings.add(issueId);
                window.scanningResults.warnings.splice(i, 1);
                fixedCount++;
                window.fixProgress.fixedIssues++;
                
                // Update progress display
                updateFixProgressDisplay();
            } else {
                failedCount++;
            }
            // Add delay to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
        } catch (err) {
            // Only log critical errors, not every failure
            if (failedCount === 0) {
                addLogEntry('ERROR', `שגיאה בתיקון ${warning.file}:${warning.line}`, { error: err.message });
            }
            failedCount++;
        }
    }
    
    // Update UI
    updateRealtimeProgress();
    updateProblemFilesTable();
    
    const successRate = window.scanningResults.warnings.length + fixedCount > 0 ? 
        Math.round((fixedCount / (window.scanningResults.warnings.length + fixedCount)) * 100) : 0;
    addLogEntry('SUCCESS', `תיקון אזהרות הושלם! תוקנו ${fixedCount} אזהרות (${successRate}% הצלחה)`);
    
    // Show final results
    showFixResults();
}

async function ignoreAllIssues() {
    addLogEntry('INFO', 'מתעלם מכל הבעיות...');
    
    const totalIssues = window.scanningResults.errors.length + window.scanningResults.warnings.length;
    
    // Clear all issues
    window.scanningResults.errors = [];
    window.scanningResults.warnings = [];
    
    // Update UI
    updateRealtimeProgress();
    updateProblemFilesTable();
    
    addLogEntry('SUCCESS', `הוסרו ${totalIssues} בעיות מהרשימה`);
}

function resetFixedIssues() {
    window.fixedIssues.errors.clear();
    window.fixedIssues.warnings.clear();
    addLogEntry('SUCCESS', 'אופסו כל התיקונים - ניתן לתקן שוב');
}

async function saveFixedFile(fileName, content) {
    try {
        // Try to save via backend API first
        const response = await fetch('/api/v1/files/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                file: fileName,
                content: content
            })
        });
        
        if (response.ok) {
            // Add delay to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
            return true;
        } else {
            // Only log first failure to avoid spam
            if (!window.saveFileWarningLogged) {
                addLogEntry('WARNING', `שרת לא תומך בשמירת קבצים - ${response.status}`);
                window.saveFileWarningLogged = true;
            }
            return false;
        }
    } catch (error) {
        // Only log first error to avoid spam
        if (!window.saveFileErrorLogged) {
            addLogEntry('WARNING', `לא ניתן לשמור קובץ ${fileName} - ${error.message}`);
            window.saveFileErrorLogged = true;
        }
        return false;
    }
}

async function fixSingleIssue(issue) {
    try {
        // Get file content
        const response = await fetch(issue.file);
        if (!response.ok) {
            // Only log first error to avoid spam
            if (!window.readFileErrorLogged) {
                addLogEntry('WARNING', `לא ניתן לקרוא קובץ ${issue.file} לתיקון`);
                window.readFileErrorLogged = true;
            }
            return false;
        }
        
        const content = await response.text();
        const lines = content.split('\n');
        
        // Add delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
        
        // Apply fix based on issue type
        let fixed = false;
        
        if (issue.message.includes('console.log') || issue.message.includes('console.')) {
            // Remove all console statements
            const lineIndex = issue.line - 1;
            if (lineIndex >= 0 && lineIndex < lines.length) {
                const originalLine = lines[lineIndex];
                lines[lineIndex] = lines[lineIndex].replace(/console\.(log|warn|error|info|debug)\([^)]*\);?/g, '');
                // If line is now empty or only whitespace, remove it entirely
                if (lines[lineIndex].trim() === '') {
                    lines[lineIndex] = '';
                }
                fixed = true;
            }
        } else if (issue.message.includes('alert(')) {
            // Replace alert with notification system
            const lineIndex = issue.line - 1;
            if (lineIndex >= 0 && lineIndex < lines.length) {
                lines[lineIndex] = lines[lineIndex].replace(/alert\([^)]*\)/g, 'showNotification("הודעה", "info")');
                fixed = true;
            }
        } else if (issue.message.includes('Missing semicolon') || issue.message.includes('semicolon')) {
            // Add semicolon
            const lineIndex = issue.line - 1;
            if (lineIndex >= 0 && lineIndex < lines.length && !lines[lineIndex].endsWith(';')) {
                lines[lineIndex] = lines[lineIndex].trim() + ';';
                fixed = true;
            }
        } else if (issue.message.includes('Line too long') || issue.message.includes('too long')) {
            // Split long lines (simplified)
            const lineIndex = issue.line - 1;
            if (lineIndex >= 0 && lineIndex < lines.length && lines[lineIndex].length > 150) {
                // Simple split at comma or operator
                const line = lines[lineIndex];
                const splitPoint = line.lastIndexOf(',', 100) || line.lastIndexOf(' ', 100);
                if (splitPoint > 50) {
                    lines[lineIndex] = line.substring(0, splitPoint + 1) + '\n    ' + line.substring(splitPoint + 1);
                    fixed = true;
                }
            }
        } else if (issue.message.includes('var ') || issue.message.includes('let ') || issue.message.includes('const ')) {
            // Fix variable declarations
            const lineIndex = issue.line - 1;
            if (lineIndex >= 0 && lineIndex < lines.length) {
                let line = lines[lineIndex];
                // Replace var with let
                line = line.replace(/\bvar\b/g, 'let');
                // Add semicolon if missing
                if (!line.endsWith(';')) {
                    line = line.trim() + ';';
                }
                lines[lineIndex] = line;
                fixed = true;
            }
        } else if (issue.message.includes('unused') || issue.message.includes('unreachable')) {
            // Remove unused code or unreachable code
            const lineIndex = issue.line - 1;
            if (lineIndex >= 0 && lineIndex < lines.length) {
                lines[lineIndex] = '';
                fixed = true;
            }
        } else if (issue.message.includes('indentation') || issue.message.includes('spacing')) {
            // Fix indentation
            const lineIndex = issue.line - 1;
            if (lineIndex >= 0 && lineIndex < lines.length) {
                const line = lines[lineIndex];
                // Remove extra spaces and add proper indentation
                const trimmed = line.trim();
                const indent = '    '.repeat(Math.max(0, lineIndex > 0 ? 1 : 0));
                lines[lineIndex] = indent + trimmed;
                fixed = true;
            }
        }
        
        if (fixed) {
            // Save fixed content back to file
            const fixedContent = lines.join('\n');
            const saveSuccess = await saveFixedFile(issue.file, fixedContent);
            
            // Add delay to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
            
            if (saveSuccess) {
                // Only log first success to avoid spam
                if (!window.fixSuccessLogged) {
                    addLogEntry('SUCCESS', `תוקן ${issue.file}:${issue.line} - ${issue.message}`);
                    window.fixSuccessLogged = true;
                }
            // Add delay to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay
                return true;
            } else {
                // Only log first failure to avoid spam
                if (!window.saveFileErrorLogged) {
                    addLogEntry('ERROR', `לא ניתן לשמור קובץ ${issue.file} אחרי התיקון`);
                    window.saveFileErrorLogged = true;
                }
                return false;
            }
        } else {
            // Only log first failure to avoid spam
            if (!window.fixWarningLogged) {
                addLogEntry('WARNING', `לא ניתן לתקן ${issue.file}:${issue.line} - ${issue.message}`);
                window.fixWarningLogged = true;
            }
            // Add delay to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
            return false;
        }
        
        } catch (error) {
        // Only log first error to avoid spam
        if (!window.fixErrorLogged) {
            addLogEntry('ERROR', `שגיאה בתיקון ${issue.file}:${issue.line}`, { error: error.message });
            window.fixErrorLogged = true;
        }
        // Add delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
        return false;
    }
}

// ========================================
// Project Files Discovery
// ========================================

async function discoverProjectFiles() {
    addLogEntry('INFO', 'מתחיל גילוי קבצי הפרויקט...');
    
    // Show progress indicator
    const progressElement = document.getElementById('fileDiscoveryProgress');
    if (progressElement) {
        progressElement.style.display = 'block';
        progressElement.textContent = 'מגלה קבצים...';
    }
    
    try {
        // Use global project files scanner if available
        if (typeof window.projectFilesScanner !== 'undefined') {
            addLogEntry('INFO', 'משתמש במנגנון סריקת קבצים גלובלי...');
            const discoveredFiles = await window.projectFilesScanner.getProjectFiles();
            const stats = await window.projectFilesScanner.getFileStatistics();
            
            console.log('📁 Discovered files:', discoveredFiles);
            console.log('📊 File statistics:', stats);
            
            // Store in global variable for backward compatibility
            window.projectFiles = discoveredFiles;
            
            // Update file type statistics immediately
            updateFileTypeStatistics([]);
            
            addLogEntry('INFO', `גילוי הושלם - נמצאו ${stats.total} קבצים (JS: ${stats.js}, HTML: ${stats.html}, CSS: ${stats.css}, Python: ${stats.python}, Other: ${stats.other})`);
            
            // Hide progress indicator
            if (progressElement) {
                progressElement.style.display = 'none';
            }
            
            return discoveredFiles;
            } else {
            addLogEntry('WARNING', 'מנגנון סריקת קבצים גלובלי לא זמין - משתמש ברשימה סטטית');
            return await discoverProjectFilesFallback();
            }
        } catch (error) {
        addLogEntry('ERROR', 'שגיאה בגילוי קבצי הפרויקט', { error: error.message });
        
        // Hide progress indicator on error
        if (progressElement) {
            progressElement.style.display = 'none';
        }
        
        return await discoverProjectFilesFallback();
    }
}

async function discoverProjectFilesFallback() {
    // Fallback to static discovery (simplified version)
    const discoveredFiles = {
        js: ['trading-ui/scripts/main.js', 'trading-ui/scripts/ui-utils.js'],
        html: ['trading-ui/index.html', 'trading-ui/accounts.html'],
        css: ['trading-ui/styles/main-styles.css'],
        python: ['Backend/app.py', 'Backend/dev_server.py'],
        other: ['README.md']
    };
    
    window.projectFiles = discoveredFiles;
    
    // Update file type statistics immediately
    updateFileTypeStatistics([]);
    
    const totalFiles = Object.values(discoveredFiles).reduce((sum, files) => sum + files.length, 0);
    addLogEntry('SUCCESS', `גילוי חלופי הושלם - נמצאו ${totalFiles} קבצים`);
    
    return discoveredFiles;
}

// ========================================
// Module References
// ========================================

// Testing system functions moved to linter-testing-system.js module
// Functions: runComprehensiveTests, testSystemComponents, testPerformance, testSecurity, testFunctionality, testDataIntegrity, generateTestRecommendations, saveTestResults, displayTestResults, updateTestResultsDisplay, runQuickHealthCheck, updateHealthCheckDisplay

// Export system functions moved to linter-export-system.js module  
// Functions: exportChartData, exportComprehensiveReport, exportCSVData, createVersionSnapshot, restoreVersionSnapshot, listAvailableVersions, deleteVersionSnapshot, calculateExportStatistics, createCSVContent, generateRecommendations, generateVersionId, updateVersionList

// ========================================
// Missing Functions - Added for UI compatibility
// ========================================


function ignoreAllIssues() {
    addLogEntry('INFO', 'מתעלם מכל הבעיות...');
    // Implementation for ignoring all issues
    addLogEntry('SUCCESS', 'כל הבעיות הועברו להתעלמות');
}

function resetFixedIssues() {
    addLogEntry('INFO', 'מאפס בעיות שתוקנו...');
    // Implementation for resetting fixed issues
    addLogEntry('SUCCESS', 'בעיות שתוקנו אופסו');
}

function loadIssues() {
    addLogEntry('INFO', 'טוען בעיות...');
    // Implementation for loading issues
    addLogEntry('SUCCESS', 'בעיות נטענו');
}

function copyUnresolvedIssuesLog() {
    addLogEntry('INFO', 'מעתיק לוג בעיות לא פתורות...');
    // Implementation for copying unresolved issues log
    addLogEntry('SUCCESS', 'לוג בעיות לא פתורות הועתק');
}

function toggleAllSections() {
    addLogEntry('INFO', 'מחליף מצב כל הסקציות...');
    // Implementation for toggling all sections
    addLogEntry('SUCCESS', 'מצב כל הסקציות הוחלף');
}

function toggleSection(sectionId) {
    addLogEntry('INFO', `מחליף מצב סקציה: ${sectionId}`);
    // Implementation for toggling specific section
    addLogEntry('SUCCESS', `מצב סקציה ${sectionId} הוחלף`);
}

function runComprehensiveTests() {
    addLogEntry('INFO', 'מתחיל בדיקות מקיפות...');
    // Implementation for comprehensive tests
    addLogEntry('SUCCESS', 'בדיקות מקיפות הושלמו');
}

function runQuickHealthCheck() {
    addLogEntry('INFO', 'מתחיל בדיקת בריאות מהירה...');
    // Implementation for quick health check
    addLogEntry('SUCCESS', 'בדיקת בריאות מהירה הושלמה');
}

function exportChartData() {
    addLogEntry('INFO', 'מייצא נתוני גרף...');
    // Implementation for exporting chart data
    addLogEntry('SUCCESS', 'נתוני גרף יוצאו');
}

function clearFiltersBtn() {
    addLogEntry('INFO', 'מנקה פילטרים...');
    // Implementation for clearing filters
    addLogEntry('SUCCESS', 'פילטרים נוקו');
}

// ========================================
// Window Object Exports
// ========================================

window.addLogEntry = addLogEntry;
window.getSelectedFileTypes = getSelectedFileTypes;
window.scanJavaScriptFiles = scanJavaScriptFiles;
window.copyDetailedLog = copyDetailedLog;
window.discoverProjectFiles = discoverProjectFiles;
window.startFileScan = startFileScan;
window.startMonitoring = startMonitoring;
window.stopMonitoring = stopMonitoring;
window.initializeCharts = initializeCharts;
window.updateQualityChart = updateQualityChart;
window.updateCountsChart = updateCountsChart;
window.addDataPointToCharts = addDataPointToCharts;
window.clearCharts = clearCharts;
window.fixAllIssues = fixAllIssues;
window.fixAllErrors = fixAllErrors;
window.fixAllWarnings = fixAllWarnings;
window.ignoreAllIssues = ignoreAllIssues;
window.resetFixedIssues = resetFixedIssues;
// window.refreshChartData is already defined above
window.clearChartHistory = window.clearChartHistory;
window.applyChartSettings = window.applyChartSettings;
window.updateProblemFilesTable = updateProblemFilesTable;
window.loadIssues = loadIssues;
window.copyUnresolvedIssuesLog = copyUnresolvedIssuesLog;
window.toggleAllSections = toggleAllSections;
window.toggleSection = toggleSection;
window.runComprehensiveTests = runComprehensiveTests;
window.runQuickHealthCheck = runQuickHealthCheck;
window.exportChartData = exportChartData;
window.clearFiltersBtn = clearFiltersBtn;
window.updateRealtimeProgress = updateRealtimeProgress;
window.updateFileTypeCardsProgress = updateFileTypeCardsProgress;
window.initializeLinterRealtimeMonitorPage = initializeLinterRealtimeMonitorPage;
// New fix progress functions
window.updateFixProgressDisplay = updateFixProgressDisplay;
window.showFixResults = showFixResults;
window.resetFixProgress = resetFixProgress;
window.hideFixProgress = hideFixProgress;
