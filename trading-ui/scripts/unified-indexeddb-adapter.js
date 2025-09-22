/**
 * Unified IndexedDB Adapter - מערכת IndexedDB מאוחדת לכל הפרויקט
 * @description מערכת מרכזית לניהול כל מסדי הנתונים של IndexedDB בפרויקט
 * @version 1.0.0
 * @author TikTrack Development Team
 * @created 2025-09-22
 * 
 * @see documentation/frontend/UNIFIED_INDEXEDDB_SPECIFICATION.md
 */

// ============================================================================
// ERROR HANDLING CLASSES
// ============================================================================

/**
 * IndexedDB Error Class - מחלקת שגיאות מותאמת למערכת IndexedDB
 */
class IndexedDBError extends Error {
    constructor(message, type = 'UNKNOWN', details = null) {
        super(message);
        this.name = 'IndexedDBError';
        this.type = type;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

/**
 * Error Types - סוגי שגיאות מוגדרים
 */
const ERROR_TYPES = {
    CONNECTION_FAILED: 'CONNECTION_FAILED',
    TRANSACTION_FAILED: 'TRANSACTION_FAILED',
    DATA_VALIDATION: 'DATA_VALIDATION',
    SCHEMA_MISMATCH: 'SCHEMA_MISMATCH',
    QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
    UNKNOWN: 'UNKNOWN'
};

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/**
 * Performance Monitor - מוניטור ביצועים למערכת IndexedDB
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            connectionTime: 0,
            transactionTime: 0,
            queryTime: 0,
            totalOperations: 0,
            failedOperations: 0
        };
        this.startTime = null;
    }

    startOperation(operationType) {
        this.startTime = performance.now();
        this.currentOperation = operationType;
    }

    endOperation() {
        if (this.startTime) {
            const duration = performance.now() - this.startTime;
            this.metrics[`${this.currentOperation}Time`] += duration;
            this.metrics.totalOperations++;
            this.startTime = null;
        }
    }

    recordFailure() {
        this.metrics.failedOperations++;
    }

    getMetrics() {
        return {
            ...this.metrics,
            successRate: this.metrics.totalOperations > 0 
                ? ((this.metrics.totalOperations - this.metrics.failedOperations) / this.metrics.totalOperations * 100).toFixed(2)
                : 100
        };
    }

    reset() {
        this.metrics = {
            connectionTime: 0,
            transactionTime: 0,
            queryTime: 0,
            totalOperations: 0,
            failedOperations: 0
        };
    }
}

// ============================================================================
// SCHEMA MIGRATOR
// ============================================================================

/**
 * Schema Migrator - מנהל מיגרציות של סכמת מסד הנתונים
 */
class SchemaMigrator {
    constructor() {
        this.currentVersion = 1;
        this.migrations = new Map();
    }

    addMigration(version, migrationFunction) {
        this.migrations.set(version, migrationFunction);
    }

    async migrate(database, oldVersion, newVersion) {
        console.log(`🔄 Starting migration from version ${oldVersion} to ${newVersion}`);
        
        for (let version = oldVersion + 1; version <= newVersion; version++) {
            const migration = this.migrations.get(version);
            if (migration) {
                console.log(`🔄 Running migration to version ${version}`);
                await migration(database);
            }
        }
        
        console.log(`✅ Migration completed successfully`);
    }
}

// ============================================================================
// MAIN UNIFIED INDEXEDDB ADAPTER
// ============================================================================

/**
 * Unified IndexedDB Adapter - המתאם המרכזי למערכת IndexedDB
 * @class UnifiedIndexedDBAdapter
 */
class UnifiedIndexedDBAdapter {
    constructor() {
        this.dbName = 'TikTrackUnifiedDB';
        this.version = 1;
        this.db = null;
        this.isInitialized = false;
        this.performanceMonitor = new PerformanceMonitor();
        this.schemaMigrator = new SchemaMigrator();
        
        // Object Stores Configuration
        this.objectStores = {
            // File Management
            fileMappings: { keyPath: 'id', autoIncrement: true },
            scanningResults: { keyPath: 'id', autoIncrement: true },
            fileAnalysis: { keyPath: 'id', autoIncrement: true },
            
            // Linter System
            linterHistory: { keyPath: 'id', autoIncrement: true },
            systemLogs: { keyPath: 'id', autoIncrement: true },
            errorReports: { keyPath: 'id', autoIncrement: true },
            
            // JS-Map Analysis
            jsMapAnalysis: { keyPath: 'id', autoIncrement: true },
            duplicatesAnalysis: { keyPath: 'id', autoIncrement: true },
            architectureCheck: { keyPath: 'id', autoIncrement: true },
            functionAnalysis: { keyPath: 'id', autoIncrement: true },
            
            // Charts & Monitoring
            chartHistory: { keyPath: 'id', autoIncrement: true },
            
            // System Management
            userPreferences: { keyPath: 'id', autoIncrement: true }
        };
    }

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    /**
     * Initialize the database
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            this.performanceMonitor.startOperation('connection');
            
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.version);
                
                request.onerror = () => {
                    this.performanceMonitor.recordFailure();
                    const error = new IndexedDBError(
                        'Failed to open database',
                        ERROR_TYPES.CONNECTION_FAILED,
                        request.error
                    );
                    console.error('❌ Database connection failed:', error);
                    reject(error);
                };
                
                request.onsuccess = () => {
                    this.db = request.result;
                    this.isInitialized = true;
                    this.performanceMonitor.endOperation();
                    console.log('✅ Unified IndexedDB initialized successfully');
                    resolve();
                };
                
                request.onupgradeneeded = (event) => {
                    this.db = event.target.result;
                    this.createObjectStores();
                    console.log('🔄 Database schema created/updated');
                };
            });
        } catch (error) {
            this.performanceMonitor.recordFailure();
            throw new IndexedDBError(
                'Database initialization failed',
                ERROR_TYPES.CONNECTION_FAILED,
                error
            );
        }
    }

    /**
     * Create all object stores
     * @private
     */
    createObjectStores() {
        for (const [storeName, config] of Object.entries(this.objectStores)) {
            if (!this.db.objectStoreNames.contains(storeName)) {
                const store = this.db.createObjectStore(storeName, config);
                
                // Add indexes for common queries
                if (storeName === 'fileMappings') {
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('source', 'source', { unique: false });
                } else if (storeName === 'linterHistory') {
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('filePath', 'filePath', { unique: false });
                } else if (storeName === 'jsMapAnalysis') {
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('analysisType', 'analysisType', { unique: false });
                }
                
                console.log(`📦 Created object store: ${storeName}`);
            }
        }
    }

    // ============================================================================
    // GENERIC CRUD OPERATIONS
    // ============================================================================

    /**
     * Save data to object store
     * @param {string} storeName - Name of object store
     * @param {Object} data - Data to save
     * @param {string} source - Source of the data
     * @returns {Promise<number>} - ID of saved record
     */
    async save(storeName, data, source = 'unknown') {
        this.validateStore(storeName);
        this.validateData(data);
        
        try {
            this.performanceMonitor.startOperation('transaction');
            
            const enrichedData = {
                ...data,
                timestamp: new Date().toISOString(),
                source: source,
                version: this.version
            };
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.add(enrichedData);
                
                request.onsuccess = () => {
                    this.performanceMonitor.endOperation();
                    console.log(`✅ Data saved to ${storeName} with ID: ${request.result}`);
                    resolve(request.result);
                };
                
                request.onerror = () => {
                    this.performanceMonitor.recordFailure();
                    const error = new IndexedDBError(
                        `Failed to save data to ${storeName}`,
                        ERROR_TYPES.TRANSACTION_FAILED,
                        request.error
                    );
                    console.error('❌ Save operation failed:', error);
                    reject(error);
                };
            });
        } catch (error) {
            this.performanceMonitor.recordFailure();
            throw new IndexedDBError(
                `Save operation failed for ${storeName}`,
                ERROR_TYPES.TRANSACTION_FAILED,
                error
            );
        }
    }

    /**
     * Get data by ID from object store
     * @param {string} storeName - Name of object store
     * @param {number} id - ID of record
     * @returns {Promise<Object|null>} - Retrieved data or null
     */
    async get(storeName, id) {
        this.validateStore(storeName);
        
        try {
            this.performanceMonitor.startOperation('query');
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.get(id);
                
                request.onsuccess = () => {
                    this.performanceMonitor.endOperation();
                    resolve(request.result || null);
                };
                
                request.onerror = () => {
                    this.performanceMonitor.recordFailure();
                    const error = new IndexedDBError(
                        `Failed to get data from ${storeName}`,
                        ERROR_TYPES.TRANSACTION_FAILED,
                        request.error
                    );
                    console.error('❌ Get operation failed:', error);
                    reject(error);
                };
            });
        } catch (error) {
            this.performanceMonitor.recordFailure();
            throw new IndexedDBError(
                `Get operation failed for ${storeName}`,
                ERROR_TYPES.TRANSACTION_FAILED,
                error
            );
        }
    }

    /**
     * Get all data from object store
     * @param {string} storeName - Name of object store
     * @returns {Promise<Array>} - Array of all records
     */
    async getAll(storeName) {
        this.validateStore(storeName);
        
        try {
            this.performanceMonitor.startOperation('query');
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.getAll();
                
                request.onsuccess = () => {
                    this.performanceMonitor.endOperation();
                    resolve(request.result || []);
                };
                
                request.onerror = () => {
                    this.performanceMonitor.recordFailure();
                    const error = new IndexedDBError(
                        `Failed to get all data from ${storeName}`,
                        ERROR_TYPES.TRANSACTION_FAILED,
                        request.error
                    );
                    console.error('❌ GetAll operation failed:', error);
                    reject(error);
                };
            });
        } catch (error) {
            this.performanceMonitor.recordFailure();
            throw new IndexedDBError(
                `GetAll operation failed for ${storeName}`,
                ERROR_TYPES.TRANSACTION_FAILED,
                error
            );
        }
    }

    /**
     * Update data in object store
     * @param {string} storeName - Name of object store
     * @param {number} id - ID of record to update
     * @param {Object} data - New data
     * @param {string} source - Source of the update
     * @returns {Promise<void>}
     */
    async update(storeName, id, data, source = 'unknown') {
        this.validateStore(storeName);
        this.validateData(data);
        
        try {
            this.performanceMonitor.startOperation('transaction');
            
            const enrichedData = {
                ...data,
                id: id,
                timestamp: new Date().toISOString(),
                source: source,
                version: this.version
            };
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.put(enrichedData);
                
                request.onsuccess = () => {
                    this.performanceMonitor.endOperation();
                    console.log(`✅ Data updated in ${storeName} with ID: ${id}`);
                    resolve();
                };
                
                request.onerror = () => {
                    this.performanceMonitor.recordFailure();
                    const error = new IndexedDBError(
                        `Failed to update data in ${storeName}`,
                        ERROR_TYPES.TRANSACTION_FAILED,
                        request.error
                    );
                    console.error('❌ Update operation failed:', error);
                    reject(error);
                };
            });
        } catch (error) {
            this.performanceMonitor.recordFailure();
            throw new IndexedDBError(
                `Update operation failed for ${storeName}`,
                ERROR_TYPES.TRANSACTION_FAILED,
                error
            );
        }
    }

    /**
     * Delete data from object store
     * @param {string} storeName - Name of object store
     * @param {number} id - ID of record to delete
     * @returns {Promise<void>}
     */
    async delete(storeName, id) {
        this.validateStore(storeName);
        
        try {
            this.performanceMonitor.startOperation('transaction');
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.delete(id);
                
                request.onsuccess = () => {
                    this.performanceMonitor.endOperation();
                    console.log(`✅ Data deleted from ${storeName} with ID: ${id}`);
                    resolve();
                };
                
                request.onerror = () => {
                    this.performanceMonitor.recordFailure();
                    const error = new IndexedDBError(
                        `Failed to delete data from ${storeName}`,
                        ERROR_TYPES.TRANSACTION_FAILED,
                        request.error
                    );
                    console.error('❌ Delete operation failed:', error);
                    reject(error);
                };
            });
        } catch (error) {
            this.performanceMonitor.recordFailure();
            throw new IndexedDBError(
                `Delete operation failed for ${storeName}`,
                ERROR_TYPES.TRANSACTION_FAILED,
                error
            );
        }
    }

    // ============================================================================
    // BATCH OPERATIONS
    // ============================================================================

    /**
     * Save multiple records in batch
     * @param {string} storeName - Name of object store
     * @param {Array} dataArray - Array of data objects
     * @param {string} source - Source of the data
     * @returns {Promise<Array>} - Array of IDs
     */
    async saveBatch(storeName, dataArray, source = 'unknown') {
        this.validateStore(storeName);
        this.validateDataArray(dataArray);
        
        try {
            this.performanceMonitor.startOperation('transaction');
            
            const enrichedDataArray = dataArray.map(data => ({
                ...data,
                timestamp: new Date().toISOString(),
                source: source,
                version: this.version
            }));
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const requests = enrichedDataArray.map(data => store.add(data));
                const results = [];
                
                let completed = 0;
                let hasError = false;
                
                requests.forEach((request, index) => {
                    request.onsuccess = () => {
                        results[index] = request.result;
                        completed++;
                        
                        if (completed === requests.length && !hasError) {
                            this.performanceMonitor.endOperation();
                            console.log(`✅ Batch saved ${dataArray.length} records to ${storeName}`);
                            resolve(results);
                        }
                    };
                    
                    request.onerror = () => {
                        hasError = true;
                        this.performanceMonitor.recordFailure();
                        const error = new IndexedDBError(
                            `Batch save failed for ${storeName}`,
                            ERROR_TYPES.TRANSACTION_FAILED,
                            request.error
                        );
                        console.error('❌ Batch save operation failed:', error);
                        reject(error);
                    };
                });
            });
        } catch (error) {
            this.performanceMonitor.recordFailure();
            throw new IndexedDBError(
                `Batch save operation failed for ${storeName}`,
                ERROR_TYPES.TRANSACTION_FAILED,
                error
            );
        }
    }

    // ============================================================================
    // ADVANCED QUERIES
    // ============================================================================

    /**
     * Query data with conditions
     * @param {string} storeName - Name of object store
     * @param {Object} conditions - Query conditions
     * @returns {Promise<Array>} - Array of matching records
     */
    async query(storeName, conditions = {}) {
        this.validateStore(storeName);
        
        try {
            this.performanceMonitor.startOperation('query');
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.getAll();
                
                request.onsuccess = () => {
                    this.performanceMonitor.endOperation();
                    const allData = request.result || [];
                    const filteredData = this.filterData(allData, conditions);
                    resolve(filteredData);
                };
                
                request.onerror = () => {
                    this.performanceMonitor.recordFailure();
                    const error = new IndexedDBError(
                        `Query operation failed for ${storeName}`,
                        ERROR_TYPES.TRANSACTION_FAILED,
                        request.error
                    );
                    console.error('❌ Query operation failed:', error);
                    reject(error);
                };
            });
        } catch (error) {
            this.performanceMonitor.recordFailure();
            throw new IndexedDBError(
                `Query operation failed for ${storeName}`,
                ERROR_TYPES.TRANSACTION_FAILED,
                error
            );
        }
    }

    /**
     * Count records in object store
     * @param {string} storeName - Name of object store
     * @returns {Promise<number>} - Number of records
     */
    async count(storeName) {
        this.validateStore(storeName);
        
        try {
            this.performanceMonitor.startOperation('query');
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.count();
                
                request.onsuccess = () => {
                    this.performanceMonitor.endOperation();
                    resolve(request.result);
                };
                
                request.onerror = () => {
                    this.performanceMonitor.recordFailure();
                    const error = new IndexedDBError(
                        `Count operation failed for ${storeName}`,
                        ERROR_TYPES.TRANSACTION_FAILED,
                        request.error
                    );
                    console.error('❌ Count operation failed:', error);
                    reject(error);
                };
            });
        } catch (error) {
            this.performanceMonitor.recordFailure();
            throw new IndexedDBError(
                `Count operation failed for ${storeName}`,
                ERROR_TYPES.TRANSACTION_FAILED,
                error
            );
        }
    }

    /**
     * Check if record exists
     * @param {string} storeName - Name of object store
     * @param {number} id - ID to check
     * @returns {Promise<boolean>} - True if exists
     */
    async exists(storeName, id) {
        try {
            const result = await this.get(storeName, id);
            return result !== null;
        } catch (error) {
            return false;
        }
    }

    // ============================================================================
    // SPECIALIZED METHODS FOR EACH SYSTEM
    // ============================================================================

    // File Management Methods
    async saveFileMapping(files, source = 'unknown') {
        return await this.save('fileMappings', { files }, source);
    }

    async getFileMapping() {
        const allMappings = await this.getAll('fileMappings');
        return allMappings.length > 0 ? allMappings[allMappings.length - 1] : null;
    }

    async saveScanningResults(results, source = 'unknown') {
        return await this.save('scanningResults', results, source);
    }

    async getScanningResults() {
        const allResults = await this.getAll('scanningResults');
        return allResults.length > 0 ? allResults[allResults.length - 1] : null;
    }

    // Linter System Methods
    async saveLinterHistory(history, source = 'unknown') {
        return await this.save('linterHistory', history, source);
    }

    async getLinterHistory() {
        return await this.getAll('linterHistory');
    }

    async saveSystemLog(log, source = 'unknown') {
        return await this.save('systemLogs', log, source);
    }

    async getSystemLogs() {
        return await this.getAll('systemLogs');
    }

    // JS-Map Analysis Methods
    async saveJsMapAnalysis(analysis, source = 'unknown') {
        return await this.save('jsMapAnalysis', analysis, source);
    }

    async getJsMapAnalysis() {
        return await this.getAll('jsMapAnalysis');
    }

    async saveDuplicatesAnalysis(analysis, source = 'unknown') {
        return await this.save('duplicatesAnalysis', analysis, source);
    }

    async getDuplicatesAnalysis() {
        return await this.getAll('duplicatesAnalysis');
    }

    // Charts & Monitoring Methods
    async saveChartHistory(chartData, source = 'unknown') {
        return await this.save('chartHistory', chartData, source);
    }

    async getChartHistory() {
        return await this.getAll('chartHistory');
    }

    // System Management Methods
    async saveUserPreferences(preferences, source = 'unknown') {
        return await this.save('userPreferences', preferences, source);
    }

    async getUserPreferences() {
        const allPrefs = await this.getAll('userPreferences');
        return allPrefs.length > 0 ? allPrefs[allPrefs.length - 1] : null;
    }

    // ============================================================================
    // DATA MANAGEMENT
    // ============================================================================

    /**
     * Clear all data from object store
     * @param {string} storeName - Name of object store
     * @returns {Promise<void>}
     */
    async clearStore(storeName) {
        this.validateStore(storeName);
        
        try {
            this.performanceMonitor.startOperation('transaction');
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();
                
                request.onsuccess = () => {
                    this.performanceMonitor.endOperation();
                    console.log(`✅ Cleared all data from ${storeName}`);
                    resolve();
                };
                
                request.onerror = () => {
                    this.performanceMonitor.recordFailure();
                    const error = new IndexedDBError(
                        `Failed to clear ${storeName}`,
                        ERROR_TYPES.TRANSACTION_FAILED,
                        request.error
                    );
                    console.error('❌ Clear operation failed:', error);
                    reject(error);
                };
            });
        } catch (error) {
            this.performanceMonitor.recordFailure();
            throw new IndexedDBError(
                `Clear operation failed for ${storeName}`,
                ERROR_TYPES.TRANSACTION_FAILED,
                error
            );
        }
    }

    /**
     * Clear all data from all stores
     * @returns {Promise<void>}
     */
    async clearAllData() {
        try {
            const storeNames = Object.keys(this.objectStores);
            const clearPromises = storeNames.map(storeName => this.clearStore(storeName));
            await Promise.all(clearPromises);
            console.log('✅ Cleared all data from all stores');
        } catch (error) {
            throw new IndexedDBError(
                'Failed to clear all data',
                ERROR_TYPES.TRANSACTION_FAILED,
                error
            );
        }
    }

    /**
     * Get statistics about stored data
     * @returns {Promise<Object>} - Statistics object
     */
    async getStatistics() {
        try {
            const stats = {};
            const storeNames = Object.keys(this.objectStores);
            
            for (const storeName of storeNames) {
                stats[storeName] = await this.count(storeName);
            }
            
            stats.totalRecords = Object.values(stats).reduce((sum, count) => sum + count, 0);
            stats.performance = this.performanceMonitor.getMetrics();
            
            return stats;
        } catch (error) {
            throw new IndexedDBError(
                'Failed to get statistics',
                ERROR_TYPES.TRANSACTION_FAILED,
                error
            );
        }
    }

    // ============================================================================
    // UTILITY METHODS
    // ============================================================================

    /**
     * Validate object store name
     * @param {string} storeName - Store name to validate
     * @private
     */
    validateStore(storeName) {
        if (!this.isInitialized) {
            throw new IndexedDBError(
                'Database not initialized',
                ERROR_TYPES.CONNECTION_FAILED
            );
        }
        
        if (!this.objectStores.hasOwnProperty(storeName)) {
            throw new IndexedDBError(
                `Invalid object store: ${storeName}`,
                ERROR_TYPES.SCHEMA_MISMATCH
            );
        }
    }

    /**
     * Validate data object
     * @param {Object} data - Data to validate
     * @private
     */
    validateData(data) {
        if (!data || typeof data !== 'object') {
            throw new IndexedDBError(
                'Invalid data: must be an object',
                ERROR_TYPES.DATA_VALIDATION
            );
        }
    }

    /**
     * Validate data array
     * @param {Array} dataArray - Data array to validate
     * @private
     */
    validateDataArray(dataArray) {
        if (!Array.isArray(dataArray)) {
            throw new IndexedDBError(
                'Invalid data: must be an array',
                ERROR_TYPES.DATA_VALIDATION
            );
        }
        
        dataArray.forEach((data, index) => {
            if (!data || typeof data !== 'object') {
                throw new IndexedDBError(
                    `Invalid data at index ${index}: must be an object`,
                    ERROR_TYPES.DATA_VALIDATION
                );
            }
        });
    }

    /**
     * Filter data based on conditions
     * @param {Array} data - Data to filter
     * @param {Object} conditions - Filter conditions
     * @returns {Array} - Filtered data
     * @private
     */
    filterData(data, conditions) {
        return data.filter(item => {
            for (const [key, value] of Object.entries(conditions)) {
                if (item[key] !== value) {
                    return false;
                }
            }
            return true;
        });
    }

    /**
     * Close database connection
     */
    close() {
        if (this.db) {
            this.db.close();
            this.isInitialized = false;
            console.log('🔒 Unified IndexedDB connection closed');
        }
    }
}

// ============================================================================
// GLOBAL EXPOSURE AND INITIALIZATION
// ============================================================================

// Create global instance
window.UnifiedIndexedDB = new UnifiedIndexedDBAdapter();

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.UnifiedIndexedDB.initialize().catch(error => {
            console.error('❌ Failed to initialize Unified IndexedDB:', error);
        });
    });
} else {
    window.UnifiedIndexedDB.initialize().catch(error => {
        console.error('❌ Failed to initialize Unified IndexedDB:', error);
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UnifiedIndexedDBAdapter, IndexedDBError, ERROR_TYPES };
}

console.log('🔧 Unified IndexedDB Adapter loaded successfully');
