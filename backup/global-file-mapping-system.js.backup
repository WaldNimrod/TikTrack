/**
 * Global File Mapping System
 * מנגנון מיפוי קבצים גלובלי לכל המערכת
 * 
 * This system provides unified file mapping functionality across all pages
 * and systems in the TikTrack application.
 */

// ========================================
// Global File Mapping System
// ========================================

/**
 * Initialize the global file mapping system
 * מגדיר את המערכת הגלובלית למיפוי קבצים
 */
function initializeGlobalFileMappingSystem() {
    console.log('🌐 Initializing Global File Mapping System...');
    
    // Ensure IndexedDB is available
    if (!window.indexedDB) {
        console.error('❌ IndexedDB not available - file mapping system disabled');
        return false;
    }
    
    // Initialize database schema
    initializeFileMappingDatabase();
    
    console.log('✅ Global File Mapping System initialized');
    return true;
}

/**
 * Initialize IndexedDB database for file mapping
 * מגדיר את מסד הנתונים IndexedDB למיפוי קבצים
 */
function initializeFileMappingDatabase() {
    const request = indexedDB.open('TikTrackFileMapping', 1);
    
    request.onerror = () => {
        console.error('❌ Failed to initialize file mapping database:', request.error);
    };
    
    request.onsuccess = () => {
        console.log('✅ File mapping database initialized');
    };
    
    request.onupgradeneeded = () => {
        const db = request.result;
        
        // Create file mappings store
        if (!db.objectStoreNames.contains('fileMappings')) {
            const fileMappingsStore = db.createObjectStore('fileMappings', { keyPath: 'id' });
            fileMappingsStore.createIndex('timestamp', 'timestamp', { unique: false });
            fileMappingsStore.createIndex('totalFiles', 'totalFiles', { unique: false });
        }
        
        // Create scanning results store
        if (!db.objectStoreNames.contains('scanningResults')) {
            const scanningResultsStore = db.createObjectStore('scanningResults', { keyPath: 'id' });
            scanningResultsStore.createIndex('timestamp', 'timestamp', { unique: false });
            scanningResultsStore.createIndex('totalErrors', 'totalErrors', { unique: false });
        }
        
        console.log('✅ Database schema created/updated');
    };
}

/**
 * Save file mapping to IndexedDB
 * שומר מיפוי קבצים ל-IndexedDB
 */
async function saveFileMappingToIndexedDB(fileMapping, source = 'unknown') {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TikTrackFileMapping', 1);
        
        request.onerror = () => {
            console.error('❌ Failed to open IndexedDB for file mapping:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            const db = request.result;
            
            // Check if object stores exist
            if (!db.objectStoreNames.contains('fileMappings')) {
                console.error('❌ Object store "fileMappings" not found - database not properly initialized');
                reject(new Error('Database not properly initialized'));
                return;
            }
            
            const transaction = db.transaction(['fileMappings'], 'readwrite');
            const store = transaction.objectStore('fileMappings');
            
            const totalFiles = Object.values(fileMapping).reduce((sum, files) => sum + files.length, 0);
            
            const saveRequest = store.put({
                id: 'lastMapping',
                files: fileMapping,
                timestamp: new Date().toISOString(),
                totalFiles: totalFiles,
                source: source,
                version: '1.0'
            });
            
            saveRequest.onsuccess = () => {
                console.log(`✅ File mapping saved to IndexedDB (${totalFiles} files from ${source})`);
                resolve({
                    success: true,
                    totalFiles: totalFiles,
                    timestamp: new Date().toISOString()
                });
            };
            
            saveRequest.onerror = () => {
                console.error('❌ Failed to save file mapping:', saveRequest.error);
                reject(saveRequest.error);
            };
        };
        
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('fileMappings')) {
                db.createObjectStore('fileMappings', { keyPath: 'id' });
            }
        };
    });
}

/**
 * Get last file mapping from IndexedDB
 * מקבל את המיפוי האחרון מ-IndexedDB
 */
async function getLastFileMappingFromIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TikTrackFileMapping', 1);
        
        request.onerror = () => {
            console.error('❌ Failed to open IndexedDB for file mapping retrieval:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['fileMappings'], 'readonly');
            const store = transaction.objectStore('fileMappings');
            
            const getRequest = store.get('lastMapping');
            
            getRequest.onsuccess = () => {
                if (getRequest.result) {
                    console.log('✅ Retrieved file mapping from IndexedDB:', getRequest.result);
                    resolve(getRequest.result);
                } else {
                    console.log('⚠️ No saved file mapping found in IndexedDB');
                    resolve(null);
                }
            };
            
            getRequest.onerror = () => {
                console.error('❌ Failed to retrieve file mapping:', getRequest.error);
                reject(getRequest.error);
            };
        };
        
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('fileMappings')) {
                db.createObjectStore('fileMappings', { keyPath: 'id' });
            }
        };
    });
}

/**
 * Save scanning results to IndexedDB
 * שומר תוצאות סריקה ל-IndexedDB
 */
async function saveScanningResultsToIndexedDB(scanningResults, source = 'unknown') {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TikTrackFileMapping', 1);
        
        request.onerror = () => {
            console.error('❌ Failed to open IndexedDB for scanning results:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            const db = request.result;
            
            // Check if object stores exist
            if (!db.objectStoreNames.contains('scanningResults')) {
                console.error('❌ Object store "scanningResults" not found - database not properly initialized');
                reject(new Error('Database not properly initialized'));
                return;
            }
            
            const transaction = db.transaction(['scanningResults'], 'readwrite');
            const store = transaction.objectStore('scanningResults');
            
            const saveRequest = store.put({
                id: 'lastScanResults',
                results: scanningResults,
                timestamp: new Date().toISOString(),
                totalErrors: scanningResults.errors.length,
                totalWarnings: scanningResults.warnings.length,
                scannedFiles: scanningResults.scannedFiles,
                source: source,
                version: '1.0'
            });
            
            saveRequest.onsuccess = () => {
                console.log(`✅ Scanning results saved to IndexedDB (${scanningResults.errors.length} errors, ${scanningResults.warnings.length} warnings from ${source})`);
                resolve({
                    success: true,
                    totalErrors: scanningResults.errors.length,
                    totalWarnings: scanningResults.warnings.length,
                    scannedFiles: scanningResults.scannedFiles,
                    timestamp: new Date().toISOString()
                });
            };
            
            saveRequest.onerror = () => {
                console.error('❌ Failed to save scanning results:', saveRequest.error);
                reject(saveRequest.error);
            };
        };
        
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('scanningResults')) {
                db.createObjectStore('scanningResults', { keyPath: 'id' });
            }
        };
    });
}

/**
 * Get last scanning results from IndexedDB
 * מקבל את תוצאות הסריקה האחרונות מ-IndexedDB
 */
async function getLastScanningResultsFromIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TikTrackFileMapping', 1);
        
        request.onerror = () => {
            console.error('❌ Failed to open IndexedDB for scanning results retrieval:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['scanningResults'], 'readonly');
            const store = transaction.objectStore('scanningResults');
            
            const getRequest = store.get('lastScanResults');
            
            getRequest.onsuccess = () => {
                if (getRequest.result) {
                    console.log('✅ Retrieved scanning results from IndexedDB:', getRequest.result);
                    resolve(getRequest.result);
                } else {
                    console.log('⚠️ No saved scanning results found in IndexedDB');
                    resolve(null);
                }
            };
            
            getRequest.onerror = () => {
                console.error('❌ Failed to retrieve scanning results:', getRequest.error);
                reject(getRequest.error);
            };
        };
        
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('scanningResults')) {
                db.createObjectStore('scanningResults', { keyPath: 'id' });
            }
        };
    });
}

/**
 * Clear all file mapping data from IndexedDB
 * מנקה את כל נתוני המיפוי מ-IndexedDB
 */
async function clearFileMappingData() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TikTrackFileMapping', 1);
        
        request.onerror = () => {
            console.error('❌ Failed to open IndexedDB for clearing data:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['fileMappings', 'scanningResults'], 'readwrite');
            
            const clearMappings = transaction.objectStore('fileMappings').clear();
            const clearResults = transaction.objectStore('scanningResults').clear();
            
            transaction.oncomplete = () => {
                console.log('✅ All file mapping data cleared from IndexedDB');
                resolve({ success: true });
            };
            
            transaction.onerror = () => {
                console.error('❌ Failed to clear file mapping data:', transaction.error);
                reject(transaction.error);
            };
        };
    });
}

/**
 * Get file mapping statistics
 * מקבל סטטיסטיקות מיפוי קבצים
 */
async function getFileMappingStatistics() {
    try {
        const lastMapping = await getLastFileMappingFromIndexedDB();
        const lastResults = await getLastScanningResultsFromIndexedDB();
        
        return {
            hasMapping: !!lastMapping,
            mappingTimestamp: lastMapping?.timestamp || null,
            totalFiles: lastMapping?.totalFiles || 0,
            hasScanResults: !!lastResults,
            scanTimestamp: lastResults?.timestamp || null,
            totalErrors: lastResults?.totalErrors || 0,
            totalWarnings: lastResults?.totalWarnings || 0,
            scannedFiles: lastResults?.scannedFiles || 0
        };
    } catch (error) {
        console.error('❌ Failed to get file mapping statistics:', error);
        return {
            hasMapping: false,
            mappingTimestamp: null,
            totalFiles: 0,
            hasScanResults: false,
            scanTimestamp: null,
            totalErrors: 0,
            totalWarnings: 0,
            scannedFiles: 0
        };
    }
}

// ========================================
// Global Exposure
// ========================================

// Expose functions globally for use across all pages
window.GlobalFileMapping = {
    initialize: initializeGlobalFileMappingSystem,
    saveFileMapping: saveFileMappingToIndexedDB,
    getFileMapping: getLastFileMappingFromIndexedDB,
    saveScanningResults: saveScanningResultsToIndexedDB,
    getScanningResults: getLastScanningResultsFromIndexedDB,
    clearData: clearFileMappingData,
    getStatistics: getFileMappingStatistics
};

// Auto-initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGlobalFileMappingSystem);
} else {
    initializeGlobalFileMappingSystem();
}

console.log('🌐 Global File Mapping System loaded');
