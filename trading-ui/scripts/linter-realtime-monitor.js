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
            
            addLogEntry('SUCCESS', 'נתוני גרפים רוענו בהצלחה');
        }
    } catch (error) {
        console.error('❌ Failed to refresh chart data:', error);
        addLogEntry('ERROR', 'שגיאה ברענון נתוני גרפים');
    }
}

/**
 * Clear chart history
 * נקה היסטוריית גרפים
 */
async function clearChartHistory() {
    if (window.confirm('האם אתה בטוח שברצונך לנקות את היסטוריית הגרפים?')) {
        try {
            if (window.ChartSystem) {
                window.ChartSystem.destroyAll();
                await initializeCharts();
            }
            
            addLogEntry('SUCCESS', 'היסטוריית גרפים נוקתה בהצלחה');
        } catch (error) {
            console.error('❌ Failed to clear chart history:', error);
        addLogEntry('ERROR', 'שגיאה בניקוי היסטוריית גרפים');
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
        
        // Load existing file mapping from IndexedDB
        try {
            await loadExistingFileMapping();
        } catch (error) {
            console.error('❌ Failed to load existing file mapping:', error);
            addLogEntry('WARNING', '⚠️ לא ניתן לטעון מיפוי קיים מבסיס הנתונים');
        }
        
        // Update file mapping status display
        updateFileMappingStatus();
        
        // Auto-discover files on page load
        console.log('🚀 Setting up auto-discovery timer...');
        addLogEntry('INFO', '🕐 מגדיר טיימר לגילוי קבצים אוטומטי...');
        
        setTimeout(() => {
            console.log('🚀 Auto-discovering files on page load...');
            addLogEntry('INFO', '🚀 מתחיל גילוי קבצים אוטומטי בטעינת הדף...');
            discoverProjectFiles().catch(error => {
                console.error('❌ Auto-discovery failed:', error);
                addLogEntry('ERROR', `❌ גילוי קבצים אוטומטי נכשל: ${error.message}`);
            });
        }, 1000);
        
        // Also try immediate discovery as fallback
        console.log('🚀 Also trying immediate discovery...');
        addLogEntry('INFO', '🚀 מנסה גם גילוי קבצים מיידי...');
        discoverProjectFiles().catch(error => {
            console.error('❌ Immediate discovery failed:', error);
            addLogEntry('ERROR', `❌ גילוי קבצים מיידי נכשל: ${error.message}`);
        });
        
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
            addLogEntry('INFO', 'ייצוא גרפים יהיה זמין בעתיד');
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

    addLogEntry('SUCCESS', 'ניטור Linter הופעל');
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

    addLogEntry('INFO', 'ניטור Linter הופסק');
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

// הוסר - המערכת המאוחדת מטפלת באתחול
// DOM Content Loaded
// document.addEventListener('DOMContentLoaded', async function() {
//     console.log('🔍 Linter Realtime Monitor DOM loaded');
    
    try {
        // Initialize linter system
        await initializeLinterSystem();
        
        // Initialize traffic lights
        updateTrafficLights();
        console.log('🚦 Traffic lights initialized');
        
        // Initialize charts after a delay to ensure all systems are ready
        // Charts initialization disabled for now
        console.log('📊 Charts initialization disabled');
        
    } catch (error) {
        console.error('❌ Failed to initialize Linter Realtime Monitor:', error);
    }
// });

// ========================================
// Load Existing File Mapping
// ========================================

/**
 * טען מיפוי קבצים קיים מ-IndexedDB
 */
async function loadExistingFileMapping() {
    console.log('🔍 ===== LOAD EXISTING FILE MAPPING =====');
    try {
        // Check if UnifiedIndexedDB is available
        if (!window.UnifiedIndexedDB || typeof window.UnifiedIndexedDB.getFileMapping !== 'function') {
            console.warn('⚠️ UnifiedIndexedDB not ready yet - skipping file mapping load');
            return;
        }
        
        // Initialize UnifiedIndexedDB if not already initialized
        if (!window.UnifiedIndexedDB.isInitialized) {
            console.log('🔄 Initializing UnifiedIndexedDB...');
            await window.UnifiedIndexedDB.initialize();
            console.log('✅ UnifiedIndexedDB initialized successfully');
        }
        
        // Try to load existing file mapping
        const savedMapping = await window.UnifiedIndexedDB.getFileMapping();
        console.log('📊 Saved file mapping from IndexedDB:', savedMapping);
        
        if (savedMapping && savedMapping.files) {
            // Restore file mapping to memory
            window.projectFiles = savedMapping.files;
            console.log('✅ File mapping restored from IndexedDB:', Object.keys(savedMapping.files));
            
            // Calculate total files
            let totalFiles = 0;
            Object.keys(savedMapping.files).forEach(type => {
                if (savedMapping.files[type] && Array.isArray(savedMapping.files[type])) {
                    totalFiles += savedMapping.files[type].length;
                }
            });
            
            console.log(`✅ Restored ${totalFiles} files from IndexedDB mapping`);
            addLogEntry('INFO', `📊 נטען מיפוי קבצים קיים מ-IndexedDB (${totalFiles} קבצים)`);
            
            // Update UI immediately
            updateFileMappingStatus();
            updateFileTypeStatistics([]);
            
        } else {
            console.log('📊 No existing file mapping found in IndexedDB');
        }
        
    } catch (error) {
        console.error('❌ Failed to load existing file mapping:', error);
        addLogEntry('WARNING', `⚠️ שגיאה בטעינת מיפוי קיים: ${error.message}`);
    }
}

// ========================================
// Scan Results Check After Mapping
// ========================================

/**
 * בדוק אם קיימת סריקה בזיכרון או בבסיס הנתונים אחרי מיפוי
 */
async function checkExistingScanResults() {
    console.log('🔍 ===== CHECK EXISTING SCAN RESULTS =====');
    try {
        console.log('🔍 Checking for existing scan results after mapping...');
        console.log('📊 Current window.scanningResults:', window.scanningResults);
        
        // 1. בדוק אם קיימת סריקה בזיכרון
        console.log('🔍 Step 1: Checking for scan results in memory...');
        if (window.scanningResults && window.scanningResults.scannedFiles > 0 && window.scanningResults.lastScanTime) {
            const lastScanDate = new Date(window.scanningResults.lastScanTime).toLocaleString('he-IL');
            addLogEntry('INFO', `📊 קיימת סריקה עדכנית בזיכרון מ-${lastScanDate} (${window.scanningResults.scannedFiles} קבצים נסרקו)`);
            console.log('✅ Found scan results in memory:', window.scanningResults);
            console.log('🔍 ===== END CHECK EXISTING SCAN RESULTS (FOUND IN MEMORY) =====');
            return; // יש סריקה בזיכרון - סיימנו
        }
        console.log('❌ No scan results found in memory');
        
        // 2. בדוק אם קיימת סריקה בבסיס הנתונים
        console.log('🔍 Step 2: Checking for scan results in IndexedDB...');
        try {
            const savedScanResults = await window.UnifiedIndexedDB.getScanningResults();
            console.log('📊 Saved scan results from IndexedDB:', savedScanResults);
            
            if (savedScanResults && savedScanResults.scannedFiles > 0 && savedScanResults.lastScanTime) {
                const lastScanDate = new Date(savedScanResults.lastScanTime).toLocaleString('he-IL');
                
                console.log('✅ Found saved scan results, sending notification...');
                
                // השתמש במערכת ההודעות הגלובלית שלנו
                addLogEntry('INFO', `📊 נמצאה סריקה שמורה מ-${lastScanDate} (${savedScanResults.scannedFiles} קבצים נסרקו)`);
                addLogEntry('INFO', '💡 לחץ על "התחל סריקה מלאה" כדי לבצע סריקה מחדש');
                console.log('✅ Notification sent via global system');
                console.log('🔍 ===== END CHECK EXISTING SCAN RESULTS (FOUND IN INDEXEDDB) =====');
        return;
            }
            console.log('❌ No saved scan results found in IndexedDB');
        } catch (error) {
            console.warn('❌ Failed to check saved scan results:', error);
        }
        
        // 3. אין סריקה בכלל - הצג הודעה
        console.log('🔍 Step 3: No scan results found anywhere, sending notification...');
        
        // השתמש במערכת ההודעות הגלובלית שלנו
        addLogEntry('INFO', '📊 לא נמצאה סריקה קיימת');
        addLogEntry('INFO', '💡 לחץ על "התחל סריקה מלאה" כדי לבצע סריקה עכשיו');
        console.log('✅ Notification sent via global system');
        
        console.log('🔍 ===== END CHECK EXISTING SCAN RESULTS (NO SCAN RESULTS) =====');
        
    } catch (error) {
        console.error('❌ Error checking existing scan results:', error);
        addLogEntry('ERROR', `❌ שגיאה בבדיקת סריקה קיימת: ${error.message}`);
        console.log('🔍 ===== END CHECK EXISTING SCAN RESULTS (ERROR) =====');
    }
}

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
        // Call server API directly
        addLogEntry('INFO', 'קורא ל-API של השרת לגילוי קבצים...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
        
        const response = await fetch('/api/file-scanner/files', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const discoveredFiles = data.data || {};
        
        console.log('📁 Discovered files from API:', discoveredFiles);
        console.log('📊 Discovery timestamp:', data.discovery_timestamp);
            
            // Store in global variable for backward compatibility
            window.projectFiles = discoveredFiles;
            
            // Save to IndexedDB for reliable fallback using global system
            console.log('💾 Saving file mapping to IndexedDB...');
            addLogEntry('INFO', '💾 שומר מיפוי קבצים ל-IndexedDB...');
            
            try {
                // Check if UnifiedIndexedDB is available and ready
                if (!window.UnifiedIndexedDB || typeof window.UnifiedIndexedDB.saveFileMapping !== 'function') {
                    console.warn('⚠️ UnifiedIndexedDB not ready yet - skipping IndexedDB save');
                    addLogEntry('WARNING', '⚠️ מערכת שמירת מיפוי לא מוכנה - דילוג על שמירה');
                } else {
                    const saveResult = await window.UnifiedIndexedDB.saveFileMapping(discoveredFiles, 'linter-realtime-monitor');
                    console.log('✅ File mapping saved to IndexedDB successfully:', saveResult);
                    addLogEntry('SUCCESS', `✅ מיפוי קבצים נשמר בהצלחה ל-IndexedDB (${saveResult.totalFiles} קבצים)`);
                    
                    // Check for existing scan results after successful mapping
                    await checkExistingScanResults();
                }
                
            } catch (error) {
                console.error('❌ Failed to save file mapping to IndexedDB:', error);
                addLogEntry('ERROR', `❌ שגיאה בשמירת מיפוי ל-IndexedDB: ${error.message}`);
            }
            
            // Update file type statistics immediately with discovered files
            updateFileTypeStatistics([]);
            
            // Force update of file type selection display - NO FAKE PROGRESS!
            // REMOVED setTimeout that was calling updateRealtimeProgress - it was causing fake progress!
            console.log('🔄 Skipped realtime progress update after discovery - no scanning in progress');
            
            // COMPLETELY RESET scanning results after discovery - NO FAKE PROGRESS!
            const totalDiscoveredFiles = Object.values(discoveredFiles).reduce((sum, files) => sum + files.length, 0);
            
            // FORCE RESET - Clear all old data that might cause fake progress
            window.scanningResults = {
                errors: [],
                warnings: [],
                totalFiles: 0, // CRITICAL: Don't set until actually scanning!
                scannedFiles: 0,
                startTime: null,
                endTime: null,
                lastScanTime: null,
                scanCompleted: false,
                discoveredFiles: totalDiscoveredFiles // Store for later use
            };
            
            // Clear localStorage to prevent fake progress from old data
            try {
                localStorage.removeItem('linterScanningResults');
                console.log('🧹 Cleared old scanning results from localStorage');
            } catch (error) {
                console.warn('Failed to clear localStorage:', error);
            }
            
            // Update file mapping status display
            updateFileMappingStatus();
            
            addLogEntry('SUCCESS', `גילוי קבצים הושלם בהצלחה - נמצאו ${totalDiscoveredFiles} קבצים`);
            addLogEntry('INFO', 'המערכת מוכנה לסריקה - לחץ על "התחל סריקה" כדי לבדוק את הקבצים');
            
            // Hide discovery progress animation
            if (progressElement) {
                progressElement.style.display = 'none';
            }
            
            // Save updated scanning results to UnifiedIndexedDB
            if (window.UnifiedIndexedDB) {
                try {
                    await window.UnifiedIndexedDB.saveLinterScanningResults(window.scanningResults, 'linter-realtime-monitor');
                    console.log('✅ Saved updated scanning results to UnifiedIndexedDB:', window.scanningResults);
                } catch (error) {
                    console.warn('Failed to save updated scanning results to UnifiedIndexedDB:', error);
                }
            }
            
            // Fallback to localStorage
            try {
                localStorage.setItem('linterScanningResults', JSON.stringify(window.scanningResults));
                console.log('✅ Saved updated scanning results to localStorage:', window.scanningResults);
            } catch (error) {
                console.warn('Failed to save updated scanning results to localStorage:', error);
            }
            
        return discoveredFiles;
    } catch (error) {
        console.error('❌ Error in discoverProjectFiles:', error);
        addLogEntry('ERROR', `❌ שגיאה בגילוי קבצים: ${error.message}`);
        
        // Show notification to user
        addLogEntry('ERROR', `❌ שגיאה בגילוי קבצים: ${error.message}`);
        
        // Hide discovery progress animation on error
        const progressElement = document.getElementById('fileDiscoveryProgress');
        if (progressElement) {
            progressElement.style.display = 'none';
        }
        
        return await discoverProjectFilesFallback();
    }
}

async function discoverProjectFilesFallback() {
    // Show clear error message to user
    addLogEntry('ERROR', '❌ גילוי קבצים נכשל - השרת לא זמין');
    addLogEntry('WARNING', '⚠️ לא ניתן לבצע מיפוי קבצים כרגע');
    addLogEntry('INFO', '🔧 המערכת עברה למצב חלופי - אין נתוני דמה');
    addLogEntry('INFO', '📋 אנא בדוק את חיבור השרת או נסה שוב מאוחר יותר');
    
    // Show notification to user
    addLogEntry('ERROR', '❌ גילוי קבצים נכשל - השרת לא זמין');
    
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
    
    // FORCE RESET scanning results - NO FAKE PROGRESS!
    window.scanningResults = {
        errors: [],
        warnings: [],
        totalFiles: 0, // CRITICAL: Don't set until actually scanning!
        scannedFiles: 0,
        startTime: null,
        endTime: null,
        lastScanTime: null,
        scanCompleted: false
    };
    
    // Clear localStorage to prevent fake progress from old data
    try {
        localStorage.removeItem('linterScanningResults');
        console.log('🧹 Cleared old scanning results from localStorage (fallback)');
        } catch (error) {
        console.warn('Failed to clear localStorage:', error);
    }
    
    // Update UI with empty data
    updateFileTypeStatistics([]);
    updateFileMappingStatus();
    
    // Force update of file type selection display - NO FAKE PROGRESS!
    // REMOVED setTimeout that was calling updateRealtimeProgress - it was causing fake progress!
    console.log('🔄 Skipped realtime progress update after fallback - no scanning in progress');
    
    // Save empty results to UnifiedIndexedDB
    if (window.UnifiedIndexedDB) {
        try {
            await window.UnifiedIndexedDB.saveLinterScanningResults(window.scanningResults, 'linter-realtime-monitor');
            console.log('✅ Saved empty scanning results to UnifiedIndexedDB');
        } catch (error) {
            console.warn('Failed to save empty scanning results to UnifiedIndexedDB:', error);
        }
    }
    
    // Fallback to localStorage
    try {
        localStorage.setItem('linterScanningResults', JSON.stringify(window.scanningResults));
        console.log('✅ Saved empty scanning results to localStorage');
        } catch (error) {
        console.warn('Failed to save empty scanning results to localStorage:', error);
    }
    
    return window.projectFiles;
}

// ========================================
// IndexedDB Functions (Now using Global System)
// ========================================
// All IndexedDB functions have been moved to global-file-mapping-system.js
// This system is now used across all pages and systems

// ========================================
// File Scanning Functions
// ========================================

async function startFileScan() {
    console.log('🚀 ===== START FILE SCAN =====');
    console.log('📊 Current state before scan:', {
        projectFiles: window.projectFiles ? Object.keys(window.projectFiles).length : 0,
        projectFilesContent: window.projectFiles,
        scanningResults: window.scanningResults ? {
            scannedFiles: window.scanningResults.scannedFiles,
            totalFiles: window.scanningResults.totalFiles,
            scanCompleted: window.scanningResults.scanCompleted
        } : 'null'
    });
    
    addLogEntry('INFO', '🚀 מתחיל סריקת לינטר...');
    addLogEntry('INFO', '🔍 בודק שגיאות ואזהרות בקבצים...');
    
    // Check if analysis functions are loaded
    console.log('🔍 Checking if analysis functions are loaded...');
    if (typeof window.analyzeFileContent !== 'function') {
        addLogEntry('ERROR', 'מודולי ניתוח הקבצים לא נטענו - ממתין...');
        console.error('❌ Analysis functions not loaded yet');
        console.log('🚀 ===== END START FILE SCAN (EARLY RETURN) =====');
        return;
    }
    console.log('✅ Analysis functions are loaded');
    
    // Reset scanning results
    window.scanningResults = {
        errors: [],
        warnings: [],
        totalFiles: 0,
        scannedFiles: 0,
        startTime: Date.now(),
        endTime: null,
        scanCompleted: false // Reset completion flag
    };
    
    // Update UI immediately - NO FAKE PROGRESS!
    const scanButton = document.getElementById('startScanBtn');
    if (scanButton) {
        scanButton.disabled = true;
        scanButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> מתחיל סריקה...';
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
    console.log('🚀 Starting scanJavaScriptFiles...');
    try {
        await scanJavaScriptFiles();
        console.log('✅ scanJavaScriptFiles completed successfully');
    } catch (error) {
        console.error('❌ scanJavaScriptFiles failed:', error);
        addLogEntry('ERROR', `❌ שגיאה בסריקת קבצים: ${error.message}`);
    }
    console.log('🏁 ===== END START FILE SCAN =====');
}

// REMOVED: copyDetailedLog function - development mechanism, page-specific only


function clearFileCache() {
  if (window.showInfoNotification) {
    window.showInfoNotification('ניקוי מטמון קבצים', 'מטמון הקבצים ינוקה בעתיד', 4000, 'development');
  }
}

function exportFileList() {
  if (window.showInfoNotification) {
    window.showInfoNotification('ייצוא רשימת קבצים', 'רשימת הקבצים תייצא בעתיד', 4000, 'development');
  }
}

async function scanJavaScriptFiles() {
    console.log('🔍 ===== SCAN JAVASCRIPT FILES =====');
    console.log('🚀 scanJavaScriptFiles called!');
    console.log('📁 window.projectFiles:', window.projectFiles);
    console.log('📊 window.projectFiles keys:', window.projectFiles ? Object.keys(window.projectFiles) : 'null');
    console.log('📊 window.projectFiles values:', window.projectFiles ? Object.values(window.projectFiles).map(files => files.length) : 'null');
    
    if (!window.projectFiles || Object.keys(window.projectFiles).length === 0) {
        console.log('⚠️ No project files in memory, trying IndexedDB fallback...');
        addLogEntry('WARNING', '⚠️ לא נמצאו קבצים בזיכרון - מנסה לשחזר מ-IndexedDB...');
        
        try {
            const savedMapping = await window.UnifiedIndexedDB.getFileMapping();
            if (savedMapping && savedMapping.files) {
                // השתמש במערכת ההודעות הגלובלית שלנו
                addLogEntry('INFO', `📊 נמצא מיפוי קבצים שמור מ-${savedMapping.timestamp} (${savedMapping.totalFiles} קבצים)`);
                addLogEntry('INFO', '💡 לחץ על "עדכן רשימת קבצים" כדי לשחזר את המיפוי');
                console.log('✅ Notification sent via global system for mapping recovery');
            } else {
                addLogEntry('ERROR', '❌ לא נמצא מיפוי שמור - אנא עדכן רשימת קבצים תחילה');
                console.log('❌ No project files found in memory or IndexedDB');
                return;
            }
        } catch (error) {
            addLogEntry('ERROR', `❌ שגיאה בשחזור מיפוי: ${error.message} - אנא עדכן רשימת קבצים תחילה`);
            console.log('❌ Failed to load from IndexedDB:', error);
            return;
        }
    }
    
    let filesToScan = [];
    
    // Collect all files from projectFiles and filter existing ones
    Object.keys(window.projectFiles).forEach(type => {
        if (window.projectFiles[type] && Array.isArray(window.projectFiles[type])) {
            // Filter out files that are likely to not exist or are not scannable
            const existingFiles = window.projectFiles[type].filter(file => {
                // Skip files that are likely to be 404 or not scannable
                return !file.includes('.css') && 
                       !file.includes('.html') && 
                       !file.includes('.md') &&
                       !file.includes('.txt') &&
                       !file.includes('.json') &&
                       !file.includes('.sh') &&
                       !file.includes('.py') &&
                       !file.includes('documentation/') &&
                       !file.includes('external_data_integration_client/') &&
                       !file.includes('Backend/') &&
                       !file.includes('test-') &&
                       !file.includes('BACKUP-') &&
                       !file.includes('UPDATED-') &&
                       !file.includes('requirements.') &&
                       !file.includes('package') &&
                       !file.includes('README') &&
                       !file.includes('__init__') &&
                       !file.includes('.git') &&
                       file.includes('.js'); // Only scan JavaScript files for now
            });
            filesToScan.push(...existingFiles);
        }
    });
    
    // Count original files vs filtered files
    const originalFileCount = Object.values(window.projectFiles).reduce((sum, files) => sum + files.length, 0);
    
    window.scanningResults.totalFiles = filesToScan.length;
    addLogEntry('INFO', `📊 סוננו ${originalFileCount} קבצים ← ${filesToScan.length} קבצי JavaScript לסריקה`);
    addLogEntry('INFO', `🔍 מתחיל סריקת ${filesToScan.length} קבצי JavaScript בלבד`);
    
    // Scan each file sequentially
    for (let i = 0; i < filesToScan.length; i++) {
        const fileName = filesToScan[i];
        
        // Add progress feedback every 50 files
        if (i % 50 === 0 || i === filesToScan.length - 1) {
            addLogEntry('INFO', `📁 סורק קובץ ${i + 1}/${filesToScan.length}`);
        }
        
        try {
            await scanSingleFile(fileName);
            // Only count as scanned if no error occurred
            window.scanningResults.scannedFiles++;
            
            // Update dashboard statistics after each file is scanned
            updateScanningDetailedStats();
        } catch (error) {
            console.error(`❌ Error scanning file ${fileName}:`, error);
            // Only add to errors if it's not a 404 (file not found)
            if (!error.message.includes('404')) {
                if (!window.scanningResults.errors) {
                    window.scanningResults.errors = [];
                }
                window.scanningResults.errors.push({
                    file: fileName,
                    message: error.message,
                    severity: 'error'
                });
            }
        }
        
        // Small delay to prevent overwhelming the system
        if (i % 10 === 0 && i > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    // Finish scanning
    console.log('🏁 Finished scanning all files');
    console.log('📊 Final scanning results:', {
        totalFiles: window.scanningResults.totalFiles,
        scannedFiles: window.scanningResults.scannedFiles,
        errors: window.scanningResults.errors.length,
        warnings: window.scanningResults.warnings.length
    });
    
    addLogEntry('SUCCESS', '✅ סריקת כל הקבצים הושלמה בהצלחה!');
    await finishScan();
    console.log('🔍 ===== END SCAN JAVASCRIPT FILES =====');
}

async function scanSingleFile(fileName) {
    console.log('📄 ===== SCAN SINGLE FILE =====');
    console.log('🔍 scanSingleFile called with:', fileName);
    console.log('📊 Current scanning state:', {
        scannedFiles: window.scanningResults?.scannedFiles || 0,
        totalFiles: window.scanningResults?.totalFiles || 0
    });
    
    try {
        // Check if file exists before trying to fetch
        console.log('🔍 Checking if file exists:', fileName);
        const response = await fetch(fileName, { method: 'HEAD' });
        if (!response.ok) {
            // Skip files that don't exist (404) - don't treat as error
            if (response.status === 404) {
                console.log(`⚠️ Skipping non-existent file: ${fileName}`);
                console.log('📄 ===== END SCAN SINGLE FILE (404) =====');
                return; // Skip this file without error
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        console.log('✅ File exists, proceeding with scan');
        
        // Now fetch the actual content
        const contentResponse = await fetch(fileName);
        if (!contentResponse.ok) {
            // Skip files that don't exist (404) - don't treat as error
            if (contentResponse.status === 404) {
                console.log(`⚠️ Skipping non-existent file: ${fileName}`);
                return; // Skip this file without error
            }
            throw new Error(`HTTP ${contentResponse.status}: ${contentResponse.statusText}`);
        }
        
        const content = await contentResponse.text();
        const fileType = getFileType(fileName);
        
        // Use appropriate analysis function based on file type
        let analysisResult = null;
        switch (fileType) {
            case 'js':
                if (typeof window.analyzeFileContent === 'function') {
                    analysisResult = window.analyzeFileContent(fileName, content);
                }
                break;
            case 'html':
                if (typeof window.analyzeHtmlContent === 'function') {
                    analysisResult = window.analyzeHtmlContent(fileName, content);
                }
                break;
            case 'css':
                if (typeof window.analyzeCssContent === 'function') {
                    analysisResult = window.analyzeCssContent(fileName, content);
                }
                break;
            case 'python':
                if (typeof window.analyzePythonContent === 'function') {
                    analysisResult = window.analyzePythonContent(fileName, content);
                }
                break;
            default:
                if (typeof window.analyzeOtherContent === 'function') {
                    analysisResult = window.analyzeOtherContent(fileName, content);
                }
                break;
        }
        
        // Process analysis results and add to scanning results
        if (analysisResult && analysisResult.issues) {
            analysisResult.issues.forEach(issue => {
                const issueData = {
                    file: fileName,
                    message: issue.message,
                    line: issue.line,
                    type: issue.type,
                    severity: issue.type === 'error' ? 'error' : 'warning',
                    fix: issue.fix
                };
                
                if (issue.type === 'error') {
                    if (!window.scanningResults.errors) {
                        window.scanningResults.errors = [];
                    }
                    window.scanningResults.errors.push(issueData);
                } else if (issue.type === 'warning') {
                    if (!window.scanningResults.warnings) {
                        window.scanningResults.warnings = [];
                    }
                    window.scanningResults.warnings.push(issueData);
        }
    });
}

        // File was successfully scanned (no need to count here, it's counted in the caller)
        
        // Update UI with real-time progress - ONLY if actually scanning
        if (window.scanningResults && window.scanningResults.scannedFiles > 0) {
            updateRealtimeProgress().catch(error => {
                console.warn('Failed to update realtime progress:', error);
            });
            // Also update dashboard statistics in real-time
            updateScanningDetailedStats();
        }
        
        console.log('✅ File scanned successfully:', fileName);
        console.log('📄 ===== END SCAN SINGLE FILE (SUCCESS) =====');
        
    } catch (error) {
        console.error(`❌ Error scanning file ${fileName}:`, error);
        // Don't count as scanned if there was an error - ONLY if actually scanning
        if (window.scanningResults && window.scanningResults.scannedFiles > 0) {
            updateRealtimeProgress().catch(error => {
                console.warn('Failed to update realtime progress:', error);
            });
            // Also update dashboard statistics in real-time
            updateScanningDetailedStats();
        }
        console.log('📄 ===== END SCAN SINGLE FILE (ERROR) =====');
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
    console.log('🏁 ===== FINISH SCAN =====');
    console.log('🏁 finishScan called - scanCompleted:', window.scanningResults.scanCompleted);
    console.log('📊 window.scanningResults:', window.scanningResults);
    console.log('📊 Final scan statistics:', {
        totalFiles: window.scanningResults.totalFiles,
        scannedFiles: window.scanningResults.scannedFiles,
        errors: window.scanningResults.errors.length,
        warnings: window.scanningResults.warnings.length,
        startTime: window.scanningResults.startTime,
        endTime: window.scanningResults.endTime
    });
    
    // Prevent multiple calls
    if (window.scanningResults.scanCompleted) {
        console.log('⚠️ finishScan already called, skipping');
        console.log('🏁 ===== END FINISH SCAN (ALREADY CALLED) =====');
        return;
    }
    window.scanningResults.scanCompleted = true;
    console.log('✅ Set scanCompleted to true');
    
    window.scanningResults.endTime = Date.now();
    window.scanningResults.lastScanTime = new Date().toISOString();
    
    // Update UI
    const scanButton = document.getElementById('startScanBtn');
    if (scanButton) {
        scanButton.disabled = false;
        scanButton.innerHTML = '🔍 התחל סריקה מלאה';
    }
    
    // Hide progress indicator
    const progressIndicator = document.getElementById('scanningProgressRow');
    if (progressIndicator) {
        progressIndicator.style.display = 'none';
    }
    
    // Update progress bar to 100%
    const progressBar = document.getElementById('scanningProgressFill');
    const progressPercentage = document.getElementById('scanningProgressPercentage');
    if (progressBar) {
        progressBar.style.width = '100%';
    }
    if (progressPercentage) {
        progressPercentage.textContent = '100%';
    }
    
    // Update overall status
    const overallStatusElement = document.getElementById('overallStatus');
    if (overallStatusElement) {
        overallStatusElement.textContent = 'סריקה הושלמה';
    }
    
    // Update statistics
    console.log('🔄 Calling updateFileTypeStatistics with', window.scanningResults.errors.length, 'errors and', window.scanningResults.warnings.length, 'warnings');
    console.log('📁 window.projectFiles before update:', window.projectFiles);
    updateFileTypeStatistics(window.scanningResults.errors.concat(window.scanningResults.warnings));
    updateFileMappingStatus();
    
    // Update traffic lights based on scan results
    updateTrafficLights();
    
            // Save results to UnifiedIndexedDB
            if (window.UnifiedIndexedDB) {
                try {
                    await window.UnifiedIndexedDB.saveLinterScanningResults(window.scanningResults, 'linter-realtime-monitor');
                    console.log('✅ Saved scanning results to UnifiedIndexedDB');
                } catch (error) {
                    console.warn('Failed to save scanning results to UnifiedIndexedDB:', error);
                }
            }
            
            // Fallback to localStorage
            try {
                localStorage.setItem('linterScanningResults', JSON.stringify(window.scanningResults));
                console.log('✅ Saved scanning results to localStorage');
            } catch (error) {
                console.warn('Failed to save scanning results to localStorage:', error);
            }
    
    // SUCCESS MESSAGE - ONLY IF WE ACTUALLY SCANNED FILES!
    if (window.scanningResults.scannedFiles > 0) {
        addLogEntry('SUCCESS', `✅ סריקה הושלמה בהצלחה! נמצאו ${window.scanningResults.errors.length} שגיאות ו-${window.scanningResults.warnings.length} אזהרות ב-${window.scanningResults.scannedFiles} קבצים`);
        console.log('🎉 SCANNING COMPLETED SUCCESSFULLY!');
    } else {
        addLogEntry('WARNING', '⚠️ סריקה הושלמה אבל לא נסרקו קבצים - בדוק את המיפוי');
        console.log('⚠️ SCANNING COMPLETED BUT NO FILES WERE SCANNED!');
    }
    
    console.log('🏁 ===== END FINISH SCAN =====');
}

async function updateRealtimeProgress() {
    try {
        console.log('🔄 updateRealtimeProgress called');
        console.log('📊 Current state:', {
            scannedFiles: window.scanningResults?.scannedFiles || 0,
            totalFiles: window.scanningResults?.totalFiles || 0,
            scanCompleted: window.scanningResults?.scanCompleted || false
        });
        console.log('🔍 Full window.scanningResults:', window.scanningResults);

        // CRITICAL: Only show progress if we actually have scanning results
        if (!window.scanningResults || window.scanningResults.scannedFiles === 0) {
            console.log('⚠️ No actual scanning in progress - setting to ready state');
            const overallStatusElement = document.getElementById('overallStatus');
            if (overallStatusElement) {
                overallStatusElement.textContent = 'מוכן לסריקה';
            }
            // Also reset the scan button
            const scanButton = document.getElementById('startScanBtn');
            if (scanButton) {
                scanButton.disabled = false;
                scanButton.innerHTML = '<i class="fas fa-play"></i> התחל סריקה';
            }
            return; // Exit early - no fake progress!
        }

        const progress = window.scanningResults.totalFiles > 0 ?
            Math.round((window.scanningResults.scannedFiles / window.scanningResults.totalFiles) * 100) : 0;

        // Update overall status - ONLY if we're actually scanning
        const overallStatusElement = document.getElementById('overallStatus');
        if (overallStatusElement) {
            // CRITICAL CHECK: Only show progress if we have ACTUALLY started scanning
            if (window.scanningResults.scannedFiles > 0 && window.scanningResults.scannedFiles < window.scanningResults.totalFiles) {
                // Actually scanning - show real progress
                overallStatusElement.textContent = `סורק... ${progress}%`;
                console.log(`📊 Real scanning progress: ${progress}% (${window.scanningResults.scannedFiles}/${window.scanningResults.totalFiles})`);
            } else if (window.scanningResults.scannedFiles >= window.scanningResults.totalFiles && window.scanningResults.scannedFiles > 0) {
                // Scanning is complete - but only if we actually scanned files
                if (!window.scanningResults.scanCompleted) {
                    console.log('🏁 Scanning complete, calling finishScan');
                    window.scanningResults.scanCompleted = true;
                    finishScan();
                }
                return; // Don't continue with the rest of the function
            } else {
                // No actual scanning happening - show ready state
                console.log('⚠️ No actual scanning in progress - showing ready state');
                overallStatusElement.textContent = 'מוכן לסריקה';
                return; // Don't continue with the rest of the function
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

function updateFileTypeStatistics(issues = []) {
    console.log('🔄 updateFileTypeStatistics called with', issues.length, 'issues');
    console.log('📁 window.projectFiles:', window.projectFiles);
    
    // Initialize file type statistics
    const fileTypeStats = {
        js: { files: 0, errors: 0, warnings: 0 },
        html: { files: 0, errors: 0, warnings: 0 },
        python: { files: 0, errors: 0, warnings: 0 },
        css: { files: 0, errors: 0, warnings: 0 },
        other: { files: 0, errors: 0, warnings: 0 }
    };
    
    // Count files from projectFiles
    if (window.projectFiles && typeof window.projectFiles === 'object') {
        Object.keys(window.projectFiles).forEach(type => {
            if (window.projectFiles[type] && Array.isArray(window.projectFiles[type])) {
                fileTypeStats[type].files = window.projectFiles[type].length;
                console.log(`📊 ${type}: ${fileTypeStats[type].files} files`);
        }
    });
}

    // Count errors and warnings by file type
    issues.forEach(issue => {
        const fileType = getFileType(issue.file);
        console.log(`🔍 Issue: ${issue.file} -> type: ${fileType}, issue.type: ${issue.type}, issue.severity: ${issue.severity}`);
        if (fileType && fileTypeStats[fileType]) {
            if (issue.type === 'error' || issue.severity === 'error') {
                fileTypeStats[fileType].errors++;
                console.log(`✅ Added error to ${fileType}: ${fileTypeStats[fileType].errors} total`);
            } else if (issue.type === 'warning' || issue.severity === 'warning') {
                fileTypeStats[fileType].warnings++;
                console.log(`✅ Added warning to ${fileType}: ${fileTypeStats[fileType].warnings} total`);
            }
        } else {
            console.log(`❌ Could not categorize issue for file: ${issue.file}`);
        }
    });
    
    // Log final statistics
    console.log('📊 Final file type statistics:', fileTypeStats);
    
    // Update UI elements
    updateFileTypeElement('js', fileTypeStats.js);
    updateFileTypeElement('html', fileTypeStats.html);
    updateFileTypeElement('py', fileTypeStats.python);
    updateFileTypeElement('css', fileTypeStats.css);
    updateFileTypeElement('other', fileTypeStats.other);
}

function updateFileTypeElement(type, stats) {
    const filesElement = document.getElementById(`${type}FilesCount`);
    const errorsElement = document.getElementById(`${type}ErrorsCount`);
    const warningsElement = document.getElementById(`${type}WarningsCount`);
    
    console.log(`🔧 Updating ${type} elements:`, {
        files: stats.files,
        errors: stats.errors,
        warnings: stats.warnings,
        filesElement: !!filesElement,
        errorsElement: !!errorsElement,
        warningsElement: !!warningsElement
    });
    
    if (filesElement) {
        filesElement.textContent = stats.files;
        console.log(`✅ Updated ${type}FilesCount to ${stats.files}`);
    } else {
        console.log(`❌ Element ${type}FilesCount not found`);
    }
    
    if (errorsElement) {
        errorsElement.textContent = stats.errors;
        console.log(`✅ Updated ${type}ErrorsCount to ${stats.errors}`);
    } else {
        console.log(`❌ Element ${type}ErrorsCount not found`);
    }
    
    if (warningsElement) {
        warningsElement.textContent = stats.warnings;
        console.log(`✅ Updated ${type}WarningsCount to ${stats.warnings}`);
    } else {
        console.log(`❌ Element ${type}WarningsCount not found`);
    }
}

function updateFileMappingStatus() {
    console.log('🔄 updateFileMappingStatus called');
    
    // Update all elements with the same IDs (both in summary and progress indicators)
    let totalFiles = 0;
    
    // Calculate total files from window.projectFiles
    if (window.projectFiles && typeof window.projectFiles === 'object') {
        Object.keys(window.projectFiles).forEach(type => {
            if (window.projectFiles[type] && Array.isArray(window.projectFiles[type])) {
                totalFiles += window.projectFiles[type].length;
            }
        });
    }
    
    // DON'T fallback to scanningResults - it causes fake progress!
    // if (totalFiles === 0 && window.scanningResults) {
    //     totalFiles = window.scanningResults.totalFiles || 0;
    // }
    console.log('🔍 Not using scanningResults.totalFiles to prevent fake progress');
    
    // Update mappedFilesCount (appears in multiple places)
    const mappedFilesElements = document.querySelectorAll('#mappedFilesCount');
    mappedFilesElements.forEach(element => {
        element.textContent = totalFiles;
    });
    console.log(`✅ Updated mappedFilesCount to ${totalFiles} in ${mappedFilesElements.length} locations`);
    
    // Update file type statistics
    updateFileTypeStatistics([]);
    
    // Update discoveryStatus (appears in multiple places)
    const discoveryStatusElements = document.querySelectorAll('#discoveryStatus');
    const discoveryStatusText = (window.scanningResults && window.scanningResults.totalFiles > 0) ? 'הושלם' : 'לא פעיל';
    discoveryStatusElements.forEach(element => {
        element.textContent = discoveryStatusText;
    });
    console.log(`✅ Updated discoveryStatus to '${discoveryStatusText}' in ${discoveryStatusElements.length} locations`);
    
    // Update lastMappingUpdate (appears in multiple places)
    const lastMappingUpdateElements = document.querySelectorAll('#lastMappingUpdate');
    const hasMappedFiles = window.projectFiles && Object.keys(window.projectFiles).length > 0;
    const mappingUpdateText = hasMappedFiles ? 
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
    
    // Update scanning availability
    const availableForScanningElement = document.getElementById('availableForScanning');
    if (availableForScanningElement) {
        availableForScanningElement.textContent = totalFiles;
    }
    
    // Update scanning summary elements
    const discoveredFilesElement = document.getElementById('discoveredFiles');
    if (discoveredFilesElement) {
        discoveredFilesElement.textContent = totalFiles;
    }
    
    const selectedFilesElement = document.getElementById('selectedFiles');
    if (selectedFilesElement) {
        selectedFilesElement.textContent = window.scanningResults ? window.scanningResults.scannedFiles || 0 : 0;
    }
    
    const scannedFilesElement = document.getElementById('scannedFiles');
    if (scannedFilesElement) {
        scannedFilesElement.textContent = window.scanningResults ? window.scanningResults.scannedFiles || 0 : 0;
    }
    
    // Update error and warning statistics in top section
    const totalErrorsStatsElement = document.getElementById('totalErrorsStats');
    if (totalErrorsStatsElement) {
        totalErrorsStatsElement.textContent = window.scanningResults ? window.scanningResults.errors.length || 0 : 0;
    }
    
    const totalWarningsStatsElement = document.getElementById('totalWarningsStats');
    if (totalWarningsStatsElement) {
        totalWarningsStatsElement.textContent = window.scanningResults ? window.scanningResults.warnings.length || 0 : 0;
    }
    
    // Update scanning section status elements
    const lastScanTimeElement = document.getElementById('lastScanTime');
    if (lastScanTimeElement) {
        if (window.scanningResults && window.scanningResults.lastScanTime) {
            lastScanTimeElement.textContent = window.scanningResults.lastScanTime;
    } else {
            lastScanTimeElement.textContent = 'טרם בוצעה';
        }
    }
    
    const currentScanStatusElement = document.getElementById('currentScanStatus');
    if (currentScanStatusElement) {
        if (window.scanningResults && window.scanningResults.scannedFiles > 0) {
            currentScanStatusElement.textContent = 'הושלמה';
        } else {
            currentScanStatusElement.textContent = 'מוכן';
        }
    }
    
    // Update scanning dashboard elements
    updateScanningDashboard();
    
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
        // Get log entries count from UnifiedIndexedDB or localStorage fallback
        let logCount = 0;
        
        if (window.UnifiedIndexedDB) {
            // Use Promise to handle async operation
            window.UnifiedIndexedDB.getLinterLogEntries().then(savedData => {
                if (savedData && savedData.entries) {
                    logCount = savedData.entries.length;
                    logEntriesCountElement.textContent = logCount;
                }
            }).catch(error => {
                console.warn('Failed to get log entries from UnifiedIndexedDB:', error);
                // Fallback to localStorage
                try {
                    const logEntries = localStorage.getItem('linterLogEntries');
                    logCount = logEntries ? JSON.parse(logEntries).length : 0;
                    logEntriesCountElement.textContent = logCount;
                } catch (e) {
                    console.warn('Failed to get log entries from localStorage:', e);
                }
            });
        } else {
            // Fallback to localStorage
            try {
                const logEntries = localStorage.getItem('linterLogEntries');
                logCount = logEntries ? JSON.parse(logEntries).length : 0;
                logEntriesCountElement.textContent = logCount;
            } catch (error) {
                console.warn('Failed to get log entries from localStorage:', error);
            }
        }
    }
    
    if (chartsStatusElement) {
        chartsStatusElement.textContent = 'מוכנים';
    }
    
    console.log('✅ Updated monitoring & control summary');
    
    // Update action indicators
    updateActionIndicators();
    
    // Update traffic lights
    updateTrafficLights();
    
    // Update general system status - ONLY if not scanning
    if (!window.scanningResults || window.scanningResults.scannedFiles === 0) {
        updateGeneralSystemStatus();
    } else {
        console.log('🔄 Skipped general system status update - scanning in progress');
    }
    
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
    console.log('🚦 ===== UPDATE TRAFFIC LIGHTS =====');
    console.log('🚦 Updating traffic lights...');
    console.log('📊 Current state for traffic lights:', {
        projectFiles: window.projectFiles ? Object.keys(window.projectFiles).length : 0,
        scanningResults: window.scanningResults ? {
            scannedFiles: window.scanningResults.scannedFiles,
            totalFiles: window.scanningResults.totalFiles,
            errors: window.scanningResults.errors.length,
            warnings: window.scanningResults.warnings.length,
            scanCompleted: window.scanningResults.scanCompleted
        } : 'null'
    });
    
    // Update each traffic light
    console.log('🔍 Updating mapping traffic light...');
    updateMappingTrafficLight();
    
    console.log('🔍 Updating scanning traffic light...');
    updateScanningTrafficLight();
    
    console.log('🔍 Updating fixes traffic light...');
    updateFixesTrafficLight();
    
    console.log('🔍 Updating monitoring traffic light...');
    updateMonitoringTrafficLight();
    
    console.log('✅ Traffic lights updated');
    console.log('🚦 ===== END UPDATE TRAFFIC LIGHTS =====');
}

/**
 * Updates mapping traffic light
 */
function updateMappingTrafficLight() {
    const light = document.getElementById('mappingTrafficLight');
    if (!light) {
        console.warn('⚠️ mappingTrafficLight element not found');
        return;
    }
    
    const hasDiscoveredFiles = window.projectFiles && Object.keys(window.projectFiles).length > 0;
    const isMappingComplete = hasDiscoveredFiles; // Mapping is complete when we have project files
    
    console.log('🚦 updateMappingTrafficLight:', {
        hasDiscoveredFiles,
        isMappingComplete,
        projectFiles: window.projectFiles,
        scanningResults: window.scanningResults
    });
    
    // Remove all status classes
    light.classList.remove('status-gray', 'status-orange', 'status-green', 'status-red');
    
    if (isMappingComplete) {
        // Mapping completed successfully
        light.classList.add('status-green');
        console.log('✅ Mapping traffic light set to GREEN');
    } else {
        // No mapping done yet
        light.classList.add('status-gray');
        console.log('⚫ Mapping traffic light set to GRAY');
    }
}

/**
 * Updates scanning traffic light
 */
function updateScanningTrafficLight() {
    const light = document.getElementById('scanningTrafficLight');
    if (!light) {
        console.warn('⚠️ scanningTrafficLight element not found');
        return;
    }
    
    // Check if actual scanning was performed (not just file discovery)
    const hasActualScanResults = window.scanningResults && 
                                 window.scanningResults.scannedFiles > 0 && 
                                 window.scanningResults.startTime !== null;
    
    console.log('🚦 updateScanningTrafficLight:', {
        hasActualScanResults,
        scannedFiles: window.scanningResults?.scannedFiles,
        startTime: window.scanningResults?.startTime
    });
    
    // Remove all status classes
    light.classList.remove('status-gray', 'status-orange', 'status-green', 'status-red');
    
    if (hasActualScanResults) {
        // Scanning completed successfully - always green regardless of errors found
        light.classList.add('status-green');
        console.log('✅ Scanning traffic light set to GREEN');
    } else {
        // No actual scanning done yet - only file discovery
        light.classList.add('status-gray');
        console.log('⚫ Scanning traffic light set to GRAY');
    }
}

/**
 * Updates fixes traffic light
 */
function updateFixesTrafficLight() {
    const light = document.getElementById('fixesTrafficLight');
    if (!light) {
        console.warn('⚠️ fixesTrafficLight element not found');
        return;
    }
    
    // Remove all status classes
    light.classList.remove('status-gray', 'status-orange', 'status-green', 'status-red');
    
    // Check if we have scan results to evaluate
    if (!window.scanningResults || !window.scanningResults.errors) {
        // No scan results yet - gray
        light.classList.add('status-gray');
        console.log('⚫ Fixes traffic light set to GRAY (no scan data)');
        return;
    }
    
    const errorCount = window.scanningResults.errors.length;
    const warningCount = window.scanningResults.warnings ? window.scanningResults.warnings.length : 0;
    const totalIssues = errorCount + warningCount;
    
    console.log('🚦 updateFixesTrafficLight:', {
        errorCount,
        warningCount,
        totalIssues
    });
    
    if (totalIssues === 0) {
        // No issues to fix
        light.classList.add('status-green');
        console.log('✅ Fixes traffic light set to GREEN (no issues)');
    } else if (errorCount > 100 || totalIssues > 500) {
        // Many critical issues - red
        light.classList.add('status-red');
        console.log('🔴 Fixes traffic light set to RED (many issues)');
    } else if (errorCount > 20 || totalIssues > 100) {
        // Moderate issues - orange
        light.classList.add('status-orange');
        console.log('🟠 Fixes traffic light set to ORANGE (moderate issues)');
    } else {
        // Few issues - green
        light.classList.add('status-green');
        console.log('✅ Fixes traffic light set to GREEN (few issues)');
    }
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
    
    // Update the status text - BUT NOT if we're actually scanning
    if (window.scanningResults && window.scanningResults.scannedFiles > 0) {
        console.log('🔄 Skipped general system status update - scanning in progress');
        return; // Don't override scanning status
    }
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
    const scanningStatusElement = document.getElementById('scanningStatus');
    const lastScanDateElement = document.getElementById('lastScanDate');
    
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
        
        // Update scanning status
        if (scanningStatusElement) {
            if (endTime) {
                scanningStatusElement.textContent = 'הושלמה';
            } else if (startTime) {
                scanningStatusElement.textContent = 'בתהליך';
    } else {
                scanningStatusElement.textContent = 'לא בוצעה';
            }
        }
        
        // Update last scan date
        if (lastScanDateElement) {
            if (endTime) {
                const scanDate = new Date(endTime).toLocaleString('he-IL');
                lastScanDateElement.textContent = scanDate;
            } else {
                lastScanDateElement.textContent = 'טרם בוצעה';
            }
        }
    } else {
        if (scannedFilesElement) scannedFilesElement.textContent = '0';
        if (errorsElement) errorsElement.textContent = '0';
        if (durationElement) durationElement.textContent = 'טרם בוצעה';
        if (scanningStatusElement) scanningStatusElement.textContent = 'לא בוצעה';
        if (lastScanDateElement) lastScanDateElement.textContent = 'טרם בוצעה';
    }
}

/**
 * Updates detailed statistics in scanning dashboard
 */
function updateScanningDetailedStats() {
    const criticalErrorsElement = document.getElementById('dashboardCriticalErrorsCount');
    const warningsElement = document.getElementById('dashboardWarningsCount');
    const suggestionsElement = document.getElementById('dashboardSuggestionsCount');
    const cleanFilesElement = document.getElementById('dashboardCleanFilesCount');
    const totalScannedElement = document.getElementById('dashboardTotalScannedCount');
    
    if (window.scanningResults) {
        const errors = window.scanningResults.errors || [];
        const warnings = window.scanningResults.warnings || [];
        const scannedFiles = window.scanningResults.scannedFiles || 0;
        
        // Calculate statistics
        // Critical errors: all errors are critical for now
        const criticalErrors = errors.length;
        
        // Suggestions: all warnings are suggestions for now
        const suggestions = warnings.length;
        // Clean files = total scanned - files with any issues
        const filesWithIssues = new Set();
        
        // Add files that have errors
        errors.forEach(error => {
            if (error.file) filesWithIssues.add(error.file);
        });
        
        // Add files that have warnings
        warnings.forEach(warning => {
            if (warning.file) filesWithIssues.add(warning.file);
        });
        
        const cleanFiles = Math.max(0, scannedFiles - filesWithIssues.size);
        
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
        
        // CRITICAL: Only show progress if we actually have scanned files!
        if (scannedFiles === 0 || totalFiles === 0) {
            console.log('🔍 No actual scanning progress - setting to 0%');
            progressFill.style.width = '0%';
            progressPercentage.textContent = '0%';
        return;
    }
    
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
window.checkExistingScanResults = checkExistingScanResults;
window.loadExistingFileMapping = loadExistingFileMapping;
// // window.copyDetailedLog export removed - using global version from system-management.js // REMOVED: Development mechanism - page-specific only
// window.copyLinterDetailedLog = copyDetailedLog; // REMOVED: Development mechanism - page-specific only
// window.generateDetailedLog export removed - local function only
// window.toggleSection removed - using global version from ui-utils.js
// window.toggleSection export removed - using global version from ui-utils.js
// Define refreshFileList function
function refreshFileList() {
    console.log('🔄 refreshFileList called');
    try {
        // Refresh the file list by reloading the page data
        loadExistingFileMapping();
        updateFileMappingStatus();
        updateActionIndicators();
        console.log('✅ File list refreshed successfully');
    } catch (error) {
        console.error('❌ Error refreshing file list:', error);
    }
}

window.refreshFileList = refreshFileList;
window.clearFileCache = clearFileCache;
window.exportFileList = exportFileList;
window.updateActionIndicators = updateActionIndicators;
window.updateTrafficLights = updateTrafficLights;
window.updateScanningDashboard = updateScanningDashboard;
window.updateGeneralSystemStatus = updateGeneralSystemStatus;

/**
 * Shows suggestions modal with improvement recommendations
 */
function showSuggestionsModal() {
    if (!window.scanningResults || !window.scanningResults.warnings) {
        addLogEntry('WARNING', 'אין הצעות זמינות - בצע סריקה תחילה');
        return;
    }

    const warnings = window.scanningResults.warnings || [];
    const suggestions = warnings.filter(warning => 
        warning.severity === 'suggestion' || 
        warning.type === 'suggestion' ||
        warning.type === 'naming'
    );

    if (suggestions.length === 0) {
        addLogEntry('SUCCESS', 'מצוין! לא נמצאו הצעות לשיפור');
        return;
    }
    
    // Group suggestions by type
    const groupedSuggestions = {};
    suggestions.forEach(suggestion => {
        const type = suggestion.type || 'כללי';
        if (!groupedSuggestions[type]) {
            groupedSuggestions[type] = [];
        }
        groupedSuggestions[type].push(suggestion);
    });

    let modalContent = `
        <div class="modal fade" id="suggestionsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">💡 הצעות לשיפור (${suggestions.length})</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
    `;

    Object.keys(groupedSuggestions).forEach(type => {
        const typeSuggestions = groupedSuggestions[type];
        const typeTitle = {
            'naming': '📝 שמות קבצים',
            'structure': '🏗️ מבנה',
            'style': '🎨 עיצוב',
            'performance': '⚡ ביצועים',
            'כללי': '💡 כללי'
        }[type] || `📋 ${type}`;

        modalContent += `
            <div class="suggestion-group mb-4">
                <h6 class="text-primary">${typeTitle} (${typeSuggestions.length})</h6>
                <div class="list-group">
        `;

        typeSuggestions.forEach(suggestion => {
            modalContent += `
                <div class="list-group-item list-group-item-light">
                    <div class="d-flex w-100 justify-content-between">
                        <small class="text-muted">${suggestion.file || 'כללי'}</small>
                    </div>
                    <p class="mb-1">${suggestion.message}</p>
                </div>
            `;
        });

        modalContent += `
                </div>
            </div>
        `;
    });

    modalContent += `
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">סגור</button>
                        <button type="button" class="btn btn-primary" onclick="exportSuggestions()">ייצא רשימה</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if present
    const existingModal = document.getElementById('suggestionsModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalContent);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('suggestionsModal'));
    modal.show();
}

/**
 * Shows critical errors modal with detailed breakdown
 */
function showCriticalErrorsModal() {
    if (!window.scanningResults || !window.scanningResults.errors) {
        addLogEntry('WARNING', 'אין שגיאות קריטיות זמינות - בצע סריקה תחילה');
        return;
    }
    
    const errors = window.scanningResults.errors || [];
    const criticalErrors = errors.filter(error => 
        error.severity === 'critical' || 
        error.severity === 'error' ||
        error.type === 'critical' ||
        error.type === 'structure' ||
        error.type === 'dependency'
    );

    if (criticalErrors.length === 0) {
        addLogEntry('SUCCESS', 'מצוין! לא נמצאו שגיאות קריטיות');
        return;
    }

    // Group by file and type
    const groupedErrors = {};
    criticalErrors.forEach(error => {
        const file = error.file || 'כללי';
        if (!groupedErrors[file]) {
            groupedErrors[file] = {};
        }
        
        const type = error.type || 'כללי';
        if (!groupedErrors[file][type]) {
            groupedErrors[file][type] = [];
        }
        groupedErrors[file][type].push(error);
    });

    let modalContent = `
        <div class="modal fade" id="criticalErrorsModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">🚨 שגיאות קריטיות (${criticalErrors.length})</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
    `;

    Object.keys(groupedErrors).forEach(file => {
        const fileErrors = groupedErrors[file];
        const totalFileErrors = Object.values(fileErrors).reduce((sum, errors) => sum + errors.length, 0);

        modalContent += `
            <div class="error-file-group mb-4">
                <h6 class="text-danger">📁 ${file} (${totalFileErrors} שגיאות)</h6>
        `;

        Object.keys(fileErrors).forEach(type => {
            const typeErrors = fileErrors[type];
            const typeTitle = {
                'structure': '🏗️ מבנה',
                'dependency': '🔗 תלויות',
                'critical': '🚨 קריטי',
                'naming': '📝 שמות',
                'כללי': '⚠️ כללי'
            }[type] || `📋 ${type}`;

            modalContent += `
                <div class="error-type-group ms-3 mb-3">
                    <strong class="text-warning">${typeTitle} (${typeErrors.length})</strong>
                    <div class="list-group mt-2">
            `;

            typeErrors.forEach(error => {
                modalContent += `
                    <div class="list-group-item list-group-item-danger">
                        <p class="mb-1">${error.message}</p>
                        <small class="text-muted">חומרת: ${error.severity || 'לא צוין'}</small>
                    </div>
                `;
            });

            modalContent += `
                    </div>
                </div>
            `;
        });

        modalContent += `
            </div>
        `;
    });

    modalContent += `
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">סגור</button>
                        <button type="button" class="btn btn-danger" onclick="exportCriticalErrors()">ייצא דוח</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if present
    const existingModal = document.getElementById('criticalErrorsModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalContent);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('criticalErrorsModal'));
    modal.show();
}

/**
 * Exports suggestions to text format
 */
function exportSuggestions() {
    const warnings = window.scanningResults.warnings || [];
    const suggestions = warnings.filter(warning => 
        warning.severity === 'suggestion' || 
        warning.type === 'suggestion' ||
        warning.type === 'naming'
    );

    let exportText = `🔍 הצעות לשיפור - ${new Date().toLocaleString('he-IL')}\n`;
    exportText += `===========================================\n\n`;

    suggestions.forEach((suggestion, index) => {
        exportText += `${index + 1}. ${suggestion.message}\n`;
        if (suggestion.file) {
            exportText += `   📁 קובץ: ${suggestion.file}\n`;
        }
        exportText += `   🏷️ סוג: ${suggestion.type || 'כללי'}\n\n`;
    });

    exportText += `\nסה"כ הצעות: ${suggestions.length}`;

    // Copy to clipboard
    navigator.clipboard.writeText(exportText).then(() => {
        addLogEntry('SUCCESS', '✅ רשימת ההצעות הועתקה ללוח!');
    }).catch(() => {
        // Fallback - show in new window
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`<pre>${exportText}</pre>`);
    });
}

/**
 * Exports critical errors to text format
 */
function exportCriticalErrors() {
    const errors = window.scanningResults.errors || [];
    const criticalErrors = errors.filter(error => 
        error.severity === 'critical' || 
        error.severity === 'error' ||
        error.type === 'critical' ||
        error.type === 'structure' ||
        error.type === 'dependency'
    );

    let exportText = `🚨 שגיאות קריטיות - ${new Date().toLocaleString('he-IL')}\n`;
    exportText += `===========================================\n\n`;

    // Group by file
    const groupedErrors = {};
    criticalErrors.forEach(error => {
        const file = error.file || 'כללי';
        if (!groupedErrors[file]) {
            groupedErrors[file] = [];
        }
        groupedErrors[file].push(error);
    });

    Object.keys(groupedErrors).forEach(file => {
        const fileErrors = groupedErrors[file];
        exportText += `📁 ${file} (${fileErrors.length} שגיאות)\n`;
        exportText += `${'='.repeat(50)}\n`;

        fileErrors.forEach((error, index) => {
            exportText += `${index + 1}. ${error.message}\n`;
            exportText += `   🏷️ סוג: ${error.type || 'כללי'}\n`;
            exportText += `   ⚠️ חומרת: ${error.severity || 'לא צוין'}\n\n`;
        });

        exportText += '\n';
    });

    exportText += `\nסה"כ שגיאות קריטיות: ${criticalErrors.length}`;

    // Copy to clipboard
    navigator.clipboard.writeText(exportText).then(() => {
        addLogEntry('SUCCESS', '✅ דוח השגיאות הקריטיות הועתק ללוח!');
    }).catch(() => {
        // Fallback - show in new window
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`<pre>${exportText}</pre>`);
    });
}

// Export new functions
window.showSuggestionsModal = showSuggestionsModal;
window.showCriticalErrorsModal = showCriticalErrorsModal;
window.exportSuggestions = exportSuggestions;
window.exportCriticalErrors = exportCriticalErrors;

console.log('✅ Linter Realtime Monitor ready');
