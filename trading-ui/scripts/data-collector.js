/**
 * ========================================
 * Data Collector Module - Linter Realtime Monitor
 * ========================================
 * 
 * מודול איסוף נתונים למערכת ניטור Linter
 * כולל ניהול סטטיסטיקות ונתוני קבצים
 * 
 * תכונות:
 * - טעינת נתונים ראשונית
 * - עדכון סטטיסטיקות
 * - ניהול נתוני קבצים
 * - חישוב גודל אחסון
 * 
 * ========================================
 * 
 * מחבר: TikTrack Development Team
 * תאריך עדכון אחרון: 2025
 * ========================================
 */

/**
 * טעינת נתונים ראשונית
 * Load initial data
 */
async function loadInitialData() {
    try {
        if (typeof window.UnifiedIndexedDB !== 'undefined') {
            const adapter = window.UnifiedIndexedDB;
            
            // Wait for IndexedDB to be initialized
            await adapter.initialize();
            
            // Load latest scanning results from IndexedDB
            const latestData = await adapter.getLinterHistory();
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
                    
                    // Update last scan date
                    const lastScanElement = document.getElementById('lastScanDate');
                    if (lastScanElement && latestScan.timestamp) {
                        const scanDate = new Date(latestScan.timestamp);
                        lastScanElement.textContent = scanDate.toLocaleString('he-IL');
                        lastScanDate = latestScan.timestamp;
                    }
                    
                    // Update statistics display
                    await updateStatisticsDisplay();
                    
                    // Data loaded successfully - charts will be updated by their respective systems
                    
                    console.log('✅ Initial data loaded successfully');
                }
            } else {
                console.log('📊 No data found in IndexedDB');
            }
        } else {
            console.log('⚠️ IndexedDB adapter not available');
        }
    } catch (error) {
        console.error('❌ Error loading initial data:', error);
        addLogEntry('ERROR', 'שגיאה בטעינת נתונים ראשונית', { error: error.message });
    }
}

/**
 * עדכון תצוגת סטטיסטיקות
 * Update statistics display
 */
async function updateStatisticsDisplay() {
    try {
        if (typeof window.UnifiedIndexedDB !== 'undefined') {
            const adapter = window.UnifiedIndexedDB;
            
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
                
                // Initialize or update global scanning results with loaded data
                if (!window.scanningResults) {
                    window.scanningResults = {};
                }
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
                
                console.log('✅ Statistics display updated');
            } else {
                console.log('📊 No data available for statistics update');
                
                // Show message that no scan has been performed yet
                const lastScanElement = document.getElementById('lastScanDate');
                if (lastScanElement) {
                    lastScanElement.textContent = 'לא בוצעה סריקה';
                }
                
                // Initialize empty scanning results if not exists
                if (!window.scanningResults) {
                    window.scanningResults = {
                        errors: [],
                        warnings: [],
                        totalFiles: 0,
                        scannedFiles: 0
                    };
                }
            }
        } else {
            console.log('⚠️ IndexedDB adapter not available for statistics update');
        }
    } catch (error) {
        console.error('❌ Error updating statistics display:', error);
        addLogEntry('ERROR', 'שגיאה בעדכון תצוגת סטטיסטיקות', { error: error.message });
    }
}

/**
 * Get file type from filename
 * קבלת סוג קובץ משם הקובץ
 */
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
        case 'pyw':
            return 'python';
        default:
            return 'other';
    }
}

/**
 * עדכון סטטיסטיקות סוגי קבצים
 * Update file type statistics
 */
function updateFileTypeStatistics(issues) {
    console.log('🔄 updateFileTypeStatistics called with issues:', issues ? issues.length : 0);
    console.log('📁 window.projectFiles:', window.projectFiles);
    
    const stats = {};
    
    // Ensure issues is an array
    const issuesArray = issues || [];
    
    // Use FileScanningState for accurate statistics
    if (fileScanningState && fileScanningState.discovered.total > 0) {
        console.log('📁 Using FileScanningState for statistics...');
        
        // Initialize stats with discovered files
        Object.keys(fileScanningState.discovered.byType).forEach(type => {
            stats[type] = { 
                files: fileScanningState.discovered.byType[type] || 0, 
                errors: 0, 
                warnings: 0 
            };
        });
        
        console.log('📁 Updated stats from FileScanningState:', stats);
    } else {
        console.warn('❌ FileScanningState not available, using fallback');
        // Fallback to old method if FileScanningState not available
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
                        console.log(`📁 ${type}: ${stats[type].files} files (${window.projectFiles[type].length} actual files)`);
                        
                        // Debug: Show first few files of each type
                        if (window.projectFiles[type].length > 0) {
                            console.log(`📁 ${type} sample files:`, window.projectFiles[type].slice(0, 3));
                        }
                    }
                });
            }
        }
    }
    
    // Count errors and warnings by file type
    issuesArray.forEach(issue => {
        const fileType = getFileType(issue.file);
        if (!stats[fileType]) {
            stats[fileType] = { files: 0, errors: 0, warnings: 0 };
        }
        
        if (issue.type === 'error') {
            stats[fileType].errors++;
        } else if (issue.type === 'warning') {
            stats[fileType].warnings++;
        }
    });
    
    console.log('🔄 Updating UI statistics:', Object.keys(stats));
    
    // Update UI with statistics
    Object.keys(stats).forEach(type => {
        const stat = stats[type];
        console.log(`📊 Processing type: ${type}, stat:`, stat);
        
        // Map file types to element IDs
        const typeMapping = {
            'js': 'js',
            'html': 'html', 
            'css': 'css',
            'python': 'py',  // python -> py for element IDs
            'other': 'other'
        };
        
        const elementId = typeMapping[type] || type;
        console.log(`📊 Mapped ${type} to elementId: ${elementId}`);
        
        // Update file count
        const fileCountElement = document.getElementById(`${elementId}FilesCount`);
        if (fileCountElement) {
            fileCountElement.textContent = stat.files;
            console.log(`✅ Updated ${elementId}FilesCount to ${stat.files}`);
        }
        
        // Update error count
        const errorCountElement = document.getElementById(`${elementId}ErrorsCount`);
        if (errorCountElement) {
            errorCountElement.textContent = stat.errors;
            console.log(`✅ Updated ${elementId}ErrorsCount to ${stat.errors}`);
        }
        
        // Update warning count
        const warningCountElement = document.getElementById(`${elementId}WarningsCount`);
        if (warningCountElement) {
            warningCountElement.textContent = stat.warnings;
            console.log(`✅ Updated ${elementId}WarningsCount to ${stat.warnings}`);
        }
    });
    
    // Debug: Log final statistics summary
    console.log('📊 Final statistics summary:');
    let totalFiles = 0;
    Object.keys(stats).forEach(type => {
        const stat = stats[type];
        totalFiles += stat.files;
        console.log(`  ${type}: ${stat.files} files, ${stat.errors} errors, ${stat.warnings} warnings`);
    });
    console.log(`📊 Total files across all types: ${totalFiles}`);
    console.log('📊 updateFileTypeStatistics completed');
}

/**
 * חישוב גודל אחסון
 * Calculate storage size
 */
function calculateStorageSize() {
    try {
        let totalSize = 0;
        
        // Calculate localStorage size
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length;
            }
        }
        
        // Calculate IndexedDB size (approximate)
        if (typeof window.linterIndexedDBAdapter !== 'undefined') {
            // This is an approximation - actual IndexedDB size calculation is complex
            totalSize += 1024 * 1024; // Assume 1MB for IndexedDB
        }
        
        // Convert to human readable format
        const formatSize = (bytes) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };
        
        const formattedSize = formatSize(totalSize);
        
        // Update UI
        const storageSizeElement = document.getElementById('storageSize');
        if (storageSizeElement) {
            storageSizeElement.textContent = formattedSize;
        }
        
        console.log(`📊 Storage size calculated: ${formattedSize}`);
        return formattedSize;
    } catch (error) {
        console.error('❌ Error calculating storage size:', error);
        return 'Unknown';
    }
}

// Export functions to global scope
window.loadInitialData = loadInitialData;
window.updateStatisticsDisplay = updateStatisticsDisplay;
window.updateFileTypeStatistics = updateFileTypeStatistics;
window.calculateStorageSize = calculateStorageSize;
window.getFileType = getFileType;

console.log('📊 Data Collector Module loaded successfully');



