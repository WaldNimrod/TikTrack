/**
 * JS-Map IndexedDB Adapter - תשתית אחסון לנתוני ניתוח JS-Map
 *
 * @description מחלקה מרכזית לניהול אחסון IndexedDB למערכת JS-Map
 * @version 1.0.0
 * @since 2025-09-19
 */

/**
 * @class JsMapIndexedDBAdapter
 * @description מתאם לניהול מסד נתונים IndexedDB למערכת JS-Map
 */
class JsMapIndexedDBAdapter {
    constructor() {
        this.dbName = 'JsMapAnalysisDB';
        this.version = 1;
        this.db = null;
        this.isInitialized = false;
        this.stores = {
            analysisHistory: 'analysis_history',
            duplicatesAnalysis: 'duplicates_analysis',
            localFunctionsAnalysis: 'local_functions_analysis',
            architectureCheck: 'architecture_check',
            systemStats: 'system_stats'
        };
    }

    /**
     * אתחול מסד הנתונים
     * @returns {Promise<IDBDatabase>} התחברות ל-DB
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('❌ שגיאה בפתיחת IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.isInitialized = true;
                console.log('✅ JS-Map IndexedDB נפתח בהצלחה');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('🔄 יצירת/עדכון schema של JS-Map IndexedDB');

                this.createStores(db);
            };
        });
    }

    /**
     * יצירת כל ה-stores
     * @param {IDBDatabase} db - מסד הנתונים
     */
    createStores(db) {
        // Store להיסטוריית ניתוחים
        if (!db.objectStoreNames.contains(this.stores.analysisHistory)) {
            const historyStore = db.createObjectStore(this.stores.analysisHistory, {
                keyPath: 'id',
                autoIncrement: false
            });

            historyStore.createIndex('timestamp', 'timestamp', { unique: false });
            historyStore.createIndex('analysisType', 'analysisType', { unique: false });
            historyStore.createIndex('sessionId', 'sessionId', { unique: false });

            console.log('📊 נוצר store analysis_history');
        }

        // Store לניתוח כפילויות
        if (!db.objectStoreNames.contains(this.stores.duplicatesAnalysis)) {
            const duplicatesStore = db.createObjectStore(this.stores.duplicatesAnalysis, {
                keyPath: 'id',
                autoIncrement: false
            });

            duplicatesStore.createIndex('timestamp', 'timestamp', { unique: false });
            duplicatesStore.createIndex('totalExact', 'summary.total_exact_duplicates', { unique: false });
            duplicatesStore.createIndex('totalPotential', 'summary.total_potential_duplicates', { unique: false });
            duplicatesStore.createIndex('duplicateRatio', 'summary.duplicate_ratio', { unique: false });

            console.log('🔍 נוצר store duplicates_analysis');
        }

        // Store לניתוח פונקציות מקומיות
        if (!db.objectStoreNames.contains(this.stores.localFunctionsAnalysis)) {
            const localFunctionsStore = db.createObjectStore(this.stores.localFunctionsAnalysis, {
                keyPath: 'id',
                autoIncrement: false
            });

            localFunctionsStore.createIndex('timestamp', 'timestamp', { unique: false });
            localFunctionsStore.createIndex('filesAnalyzed', 'summary.files_analyzed', { unique: false });
            localFunctionsStore.createIndex('filesWithIssues', 'summary.files_with_issues', { unique: false });
            localFunctionsStore.createIndex('totalIssues', 'summary.total_local_function_issues', { unique: false });

            console.log('🏠 נוצר store local_functions_analysis');
        }

        // Store לבדיקת ארכיטקטורה
        if (!db.objectStoreNames.contains(this.stores.architectureCheck)) {
            const architectureStore = db.createObjectStore(this.stores.architectureCheck, {
                keyPath: 'id',
                autoIncrement: false
            });

            architectureStore.createIndex('timestamp', 'timestamp', { unique: false });
            architectureStore.createIndex('totalHtmlFiles', 'total_html_files', { unique: false });
            architectureStore.createIndex('compliantFiles', 'compliant_files', { unique: false });
            architectureStore.createIndex('violationsCount', 'violations.length', { unique: false });
            architectureStore.createIndex('isCompliant', 'is_compliant', { unique: false });

            console.log('🏗️ נוצר store architecture_check');
        }

        // Store לסטטיסטיקות מערכת
        if (!db.objectStoreNames.contains(this.stores.systemStats)) {
            const statsStore = db.createObjectStore(this.stores.systemStats, {
                keyPath: 'id',
                autoIncrement: false
            });

            statsStore.createIndex('timestamp', 'timestamp', { unique: false });
            statsStore.createIndex('totalFiles', 'total_files', { unique: false });
            statsStore.createIndex('totalFunctions', 'total_functions', { unique: false });
            statsStore.createIndex('totalPages', 'total_pages', { unique: false });

            console.log('📈 נוצר store system_stats');
        }
    }

    /**
     * בדיקת אם ה-DB מאותחל
     * @returns {boolean} סטטוס אתחול
     */
    isReady() {
        return this.isInitialized && this.db !== null;
    }

    /**
     * סגירת חיבור ל-DB
     */
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
            this.isInitialized = false;
            console.log('🔒 חיבור JS-Map IndexedDB נסגר');
        }
    }

    /**
     * שמירת ניתוח כפילויות
     * @param {Object} analysisData - נתוני הניתוח
     * @returns {Promise<string>} ID של הניתוח שנשמר
     */
    async saveDuplicatesAnalysis(analysisData) {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        const id = `duplicates_${Date.now()}`;
        const data = {
            id,
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId(),
            ...analysisData
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.duplicatesAnalysis], 'readwrite');
            const store = transaction.objectStore(this.stores.duplicatesAnalysis);

            const request = store.add(data);

            request.onsuccess = () => {
                console.log('✅ ניתוח כפילויות נשמר:', id);
                resolve(id);
            };

            request.onerror = () => {
                console.error('❌ שגיאה בשמירת ניתוח כפילויות:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * שמירת ניתוח פונקציות מקומיות
     * @param {Object} analysisData - נתוני הניתוח
     * @returns {Promise<string>} ID של הניתוח שנשמר
     */
    async saveLocalFunctionsAnalysis(analysisData) {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        const id = `local_functions_${Date.now()}`;
        const data = {
            id,
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId(),
            ...analysisData
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.localFunctionsAnalysis], 'readwrite');
            const store = transaction.objectStore(this.stores.localFunctionsAnalysis);

            const request = store.add(data);

            request.onsuccess = () => {
                console.log('✅ ניתוח פונקציות מקומיות נשמר:', id);
                resolve(id);
            };

            request.onerror = () => {
                console.error('❌ שגיאה בשמירת ניתוח פונקציות מקומיות:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * שמירת בדיקת ארכיטקטורה
     * @param {Object} checkData - נתוני הבדיקה
     * @returns {Promise<string>} ID של הבדיקה שנשמרה
     */
    async saveArchitectureCheck(checkData) {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        const id = `architecture_${Date.now()}`;
        const data = {
            id,
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId(),
            ...checkData
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.architectureCheck], 'readwrite');
            const store = transaction.objectStore(this.stores.architectureCheck);

            const request = store.add(data);

            request.onsuccess = () => {
                console.log('✅ בדיקת ארכיטקטורה נשמרה:', id);
                resolve(id);
            };

            request.onerror = () => {
                console.error('❌ שגיאה בשמירת בדיקת ארכיטקטורה:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * שמירת סטטיסטיקות מערכת
     * @param {Object} statsData - נתוני הסטטיסטיקות
     * @returns {Promise<string>} ID של הסטטיסטיקות שנשמרו
     */
    async saveSystemStats(statsData) {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        const id = `stats_${Date.now()}`;
        const data = {
            id,
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId(),
            ...statsData
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.systemStats], 'readwrite');
            const store = transaction.objectStore(this.stores.systemStats);

            const request = store.add(data);

            request.onsuccess = () => {
                console.log('✅ סטטיסטיקות מערכת נשמרו:', id);
                resolve(id);
            };

            request.onerror = () => {
                console.error('❌ שגיאה בשמירת סטטיסטיקות מערכת:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * טעינת היסטוריית ניתוחים
     * @param {string} analysisType - סוג הניתוח (אופציונלי)
     * @param {number} limit - מספר רשומות מקסימלי
     * @returns {Promise<Array>} רשימת ניתוחים
     */
    async loadAnalysisHistory(analysisType = null, limit = 50) {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        const stores = analysisType ? [this.stores[analysisType]] : Object.values(this.stores);
        const results = [];

        for (const storeName of stores) {
            const storeResults = await this.loadFromStore(storeName, limit);
            results.push(...storeResults);
        }

        // מיון לפי זמן (הכי חדש קודם)
        results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return results.slice(0, limit);
    }

    /**
     * טעינת נתונים מ-store
     * @param {string} storeName - שם ה-store
     * @param {number} limit - מספר רשומות מקסימלי
     * @returns {Promise<Array>} רשימת נתונים
     */
    async loadFromStore(storeName, limit = 50) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index('timestamp');
            
            const request = index.openCursor(null, 'prev'); // מהכי חדש לכי ישן
            const results = [];

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && results.length < limit) {
                    results.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * מחיקת נתונים ישנים
     * @param {number} daysToKeep - מספר ימים לשמירה
     * @returns {Promise<number>} מספר רשומות שנמחקו
     */
    async cleanupOldData(daysToKeep = 30) {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const cutoffTimestamp = cutoffDate.toISOString();

        let totalDeleted = 0;

        for (const storeName of Object.values(this.stores)) {
            const deleted = await this.deleteOldFromStore(storeName, cutoffTimestamp);
            totalDeleted += deleted;
        }

        console.log(`🧹 נוקו ${totalDeleted} רשומות ישנות (מעל ${daysToKeep} ימים)`);
        return totalDeleted;
    }

    /**
     * מחיקת נתונים ישנים מ-store
     * @param {string} storeName - שם ה-store
     * @param {string} cutoffTimestamp - זמן חיתוך
     * @returns {Promise<number>} מספר רשומות שנמחקו
     */
    async deleteOldFromStore(storeName, cutoffTimestamp) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const index = store.index('timestamp');
            
            const request = index.openCursor(IDBKeyRange.upperBound(cutoffTimestamp));
            let deletedCount = 0;

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    deletedCount++;
                    cursor.continue();
                } else {
                    resolve(deletedCount);
                }
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * קבלת סטטיסטיקות אחסון
     * @returns {Promise<Object>} סטטיסטיקות
     */
    async getStorageStats() {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        const stats = {};

        for (const [key, storeName] of Object.entries(this.stores)) {
            const count = await this.getStoreCount(storeName);
            stats[key] = count;
        }

        stats.total = Object.values(stats).reduce((sum, count) => sum + count, 0);
        stats.lastUpdated = new Date().toISOString();

        return stats;
    }

    /**
     * קבלת סטטיסטיקות מפורטות (alias ל-getStorageStats)
     * @returns {Promise<Object>} סטטיסטיקות מפורטות
     */
    async getStatistics() {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        const stats = await this.getStorageStats();
        
        // הוספת מידע נוסף
        stats.totalRecords = stats.total;
        stats.totalSize = await this.getTotalSize();
        stats.lastUpdated = new Date().toLocaleString('he-IL');

        return stats;
    }

    /**
     * חישוב גודל כולל של הנתונים
     * @returns {Promise<number>} גודל בבתים
     */
    async getTotalSize() {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        let totalSize = 0;

        for (const storeName of Object.values(this.stores)) {
            const storeSize = await this.getStoreSize(storeName);
            totalSize += storeSize;
        }

        return totalSize;
    }

    /**
     * חישוב גודל store
     * @param {string} storeName - שם ה-store
     * @returns {Promise<number>} גודל בבתים
     */
    async getStoreSize(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                const data = request.result;
                const size = JSON.stringify(data).length * 2; // Unicode characters
                resolve(size);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * ספירת רשומות ב-store
     * @param {string} storeName - שם ה-store
     * @returns {Promise<number>} מספר רשומות
     */
    async getStoreCount(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.count();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * יצירת session ID
     * @returns {string} session ID
     */
    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        return this.sessionId;
    }

    /**
     * גיבוי נתונים
     * @returns {Promise<Object>} נתוני גיבוי
     */
    async backupData() {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        const backup = {
            timestamp: new Date().toISOString(),
            version: this.version,
            data: {}
        };

        for (const [key, storeName] of Object.entries(this.stores)) {
            const data = await this.loadFromStore(storeName, 1000); // עד 1000 רשומות
            backup.data[key] = data;
        }

        console.log('💾 גיבוי נתונים הושלם:', backup.timestamp);
        return backup;
    }

    /**
     * שחזור נתונים מגיבוי
     * @param {Object} backupData - נתוני גיבוי
     * @returns {Promise<boolean>} הצלחה
     */
    async restoreData(backupData) {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        try {
            for (const [storeKey, data] of Object.entries(backupData.data)) {
                const storeName = this.stores[storeKey];
                if (storeName && Array.isArray(data)) {
                    await this.clearStore(storeName);
                    
                    for (const item of data) {
                        await this.addToStore(storeName, item);
                    }
                }
            }

            console.log('🔄 שחזור נתונים הושלם');
            return true;
        } catch (error) {
            console.error('❌ שגיאה בשחזור נתונים:', error);
            return false;
        }
    }

    /**
     * ניקוי store
     * @param {string} storeName - שם ה-store
     */
    async clearStore(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * הוספת נתונים ל-store
     * @param {string} storeName - שם ה-store
     * @param {Object} data - נתונים
     */
    async addToStore(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// יצירת instance גלובלי
window.jsMapIndexedDBAdapter = new JsMapIndexedDBAdapter();

// אתחול אוטומטי
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.jsMapIndexedDBAdapter.initialize();
        console.log('🎯 JS-Map IndexedDB Adapter מוכן לשימוש');
    } catch (error) {
        console.error('❌ שגיאה באתחול JS-Map IndexedDB Adapter:', error);
    }
});

// Export למקרה של שימוש ב-modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JsMapIndexedDBAdapter;
}
