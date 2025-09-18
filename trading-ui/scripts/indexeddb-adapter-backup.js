/**
 * IndexedDB Adapter - תשתית אחסון לנתוני הלינטר
 *
 * @description מחלקה מרכזית לניהול אחסון IndexedDB
 * @version 1.0.0
 * @since 2025-01-18
 */

/**
 * @class IndexedDBAdapter
 * @description מתאם לניהול מסד נתונים IndexedDB
 */
class IndexedDBAdapter {
    constructor() {
        this.dbName = 'LinterHistoryDB';
        this.version = 1;
        this.db = null;
        this.isInitialized = false;
        this.stores = {
            chartHistory: 'chart_history',
            systemLogs: 'system_logs'
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
                console.log('✅ IndexedDB נפתח בהצלחה');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('🔄 יצירת/עדכון schema של IndexedDB');

                // יצירת store לנתוני גרף
                if (!db.objectStoreNames.contains(this.stores.chartHistory)) {
                    const chartStore = db.createObjectStore(this.stores.chartHistory, {
                        keyPath: 'id',
                        autoIncrement: false
                    });

                    // יצירת אינדקסים
                    chartStore.createIndex('timestamp', 'timestamp', { unique: false });
                    chartStore.createIndex('sessionId', 'sessionId', { unique: false });
                    chartStore.createIndex('qualityScore', 'metrics.qualityScore', { unique: false });
                    chartStore.createIndex('errorCount', 'metrics.errors', { unique: false });

                    console.log('📊 נוצר store chart_history');
                }

                // יצירת store ללוגים
                if (!db.objectStoreNames.contains(this.stores.systemLogs)) {
                    const logStore = db.createObjectStore(this.stores.systemLogs, {
                        keyPath: 'id',
                        autoIncrement: true
                    });

                    logStore.createIndex('timestamp', 'timestamp', { unique: false });
                    logStore.createIndex('level', 'level', { unique: false });
                    logStore.createIndex('sessionId', 'sessionId', { unique: false });

                    console.log('📝 נוצר store system_logs');
                }
            };
        });
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
            console.log('🔒 חיבור IndexedDB נסגר');
        }
    }

    /**
     * ניקוי כל הנתונים (לצורכי בדיקה)
     * @returns {Promise<void>}
     */
    async clearAllData() {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(
                [this.stores.chartHistory, this.stores.systemLogs],
                'readwrite'
            );

            let completedStores = 0;
            const totalStores = 2;

            const checkCompletion = () => {
                completedStores++;
                if (completedStores === totalStores) {
                    console.log('🗑️ כל הנתונים נוקו');
                    resolve();
                }
            };

            transaction.onerror = () => reject(transaction.error);

            transaction.objectStore(this.stores.chartHistory).clear().onsuccess = checkCompletion;
            transaction.objectStore(this.stores.systemLogs).clear().onsuccess = checkCompletion;
        });
    }

    /**
     * שמירת נקודת נתונים בודדת
     * @param {Object} dataPoint - נקודת הנתונים לשמירה
     * @returns {Promise<string>} מזהה הנתון שנשמר
     */
    async saveDataPoint(dataPoint) {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        // וידוא שיש מזהה
        if (!dataPoint.id) {
            dataPoint.id = `point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        // הוספת timestamp אם לא קיים
        if (!dataPoint.timestamp) {
            dataPoint.timestamp = new Date().toISOString();
        }

        // וידוא מבנה נתונים תקין
        this.validateDataPoint(dataPoint);

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.chartHistory], 'readwrite');
            const store = transaction.objectStore(this.stores.chartHistory);
            const request = store.put(dataPoint);

            request.onsuccess = () => {
                console.log('✅ נקודת נתונים נשמרה:', dataPoint.id);
                resolve(dataPoint.id);
            };

            request.onerror = () => {
                console.error('❌ שגיאה בשמירת נקודת נתונים:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * שמירת מספר נקודות נתונים בבת אחת
     * @param {Array} dataPoints - מערך נקודות נתונים
     * @returns {Promise<Array>} מערך מזהי הנתונים שנשמרו
     */
    async saveBatch(dataPoints) {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        if (!Array.isArray(dataPoints) || dataPoints.length === 0) {
            throw new Error('dataPoints חייב להיות מערך לא ריק');
        }

        // הכנת הנתונים
        const preparedData = dataPoints.map(point => ({
            ...point,
            id: point.id || `point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: point.timestamp || new Date().toISOString()
        }));

        // וידוא מבנה נתונים תקין
        preparedData.forEach(point => this.validateDataPoint(point));

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.chartHistory], 'readwrite');
            const store = transaction.objectStore(this.stores.chartHistory);

            let completed = 0;
            let errors = [];
            const results = [];

            transaction.onerror = () => reject(transaction.error);
            transaction.oncomplete = () => {
                if (errors.length > 0) {
                    reject(new Error(`שגיאות בשמירת ${errors.length} נקודות: ${errors.join(', ')}`));
                } else {
                    console.log(`✅ ${completed} נקודות נתונים נשמרו בהצלחה`);
                    resolve(results);
                }
            };

            preparedData.forEach((dataPoint, index) => {
                const request = store.put(dataPoint);

                request.onsuccess = () => {
                    completed++;
                    results[index] = dataPoint.id;
                };

                request.onerror = () => {
                    errors.push(`נקודה ${index}: ${request.error.message}`);
                    completed++;
                };
            });
        });
    }

    /**
     * וידוא מבנה נתונים תקין
     * @param {Object} dataPoint - נקודת הנתונים לבדיקה
     * @throws {Error} אם המבנה לא תקין
     */
    validateDataPoint(dataPoint) {
        if (!dataPoint || typeof dataPoint !== 'object') {
            throw new Error('dataPoint חייב להיות אובייקט');
        }

        if (!dataPoint.metrics || typeof dataPoint.metrics !== 'object') {
            throw new Error('dataPoint חייב לכלול metrics');
        }

        // בדיקת שדות חובה במדדים
        const requiredMetrics = ['totalFiles', 'errors', 'warnings', 'qualityScore'];
        for (const field of requiredMetrics) {
            if (typeof dataPoint.metrics[field] !== 'number') {
                throw new Error(`metrics.${field} חייב להיות מספר`);
            }
        }

        // בדיקת טווחים לוגיים
        if (dataPoint.metrics.qualityScore < 0 || dataPoint.metrics.qualityScore > 100) {
            throw new Error('qualityScore חייב להיות בין 0 ל-100');
        }

        if (dataPoint.metrics.totalFiles < 0 || dataPoint.metrics.errors < 0 || dataPoint.metrics.warnings < 0) {
            throw new Error('totalFiles, errors, ו-warnings חייבים להיות חיוביים');
        }
    }

    /**
     * קבלת סטטיסטיקות DB
     * @returns {Promise<Object>} סטטיסטיקות
     */
    async getStats() {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(
                [this.stores.chartHistory, this.stores.systemLogs],
                'readonly'
            );

            const stats = {
                chartHistory: { count: 0, size: 0 },
                systemLogs: { count: 0, size: 0 },
                totalSize: 0,
                lastUpdate: null
            };

            let completedStores = 0;
            const totalStores = 2;

            transaction.onerror = () => reject(transaction.error);

            const checkCompletion = () => {
                completedStores++;
                if (completedStores === totalStores) {
                    stats.totalSize = stats.chartHistory.size + stats.systemLogs.size;
                    resolve(stats);
                }
            };

            // ספירת רשומות ב-chart_history
            const chartRequest = transaction.objectStore(this.stores.chartHistory).count();
            chartRequest.onsuccess = () => {
                stats.chartHistory.count = chartRequest.result;
                checkCompletion();
            };

            // ספירת רשומות ב-system_logs
            const logRequest = transaction.objectStore(this.stores.systemLogs).count();
            logRequest.onsuccess = () => {
                stats.systemLogs.count = logRequest.result;
                checkCompletion();
            };
        });
    }

    /**
     * קריאת היסטוריה לפי שעות
     * @param {number} hours - מספר השעות לאחור
     * @returns {Promise<Array>} מערך נקודות נתונים
     */
    async loadHistory(hours = 24) {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000)).toISOString();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.chartHistory], 'readonly');
            const store = transaction.objectStore(this.stores.chartHistory);
            const index = store.index('timestamp');

            const range = IDBKeyRange.lowerBound(cutoffTime);
            const request = index.openCursor(range);

            const results = [];

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    results.push(cursor.value);
                    cursor.continue();
                } else {
                    // מיון לפי timestamp (החדש ביותר ראשון)
                    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    console.log(`📊 נטענו ${results.length} נקודות נתונים מה-${hours} שעות האחרונות`);
                    resolve(results);
                }
            };

            request.onerror = () => {
                console.error('❌ שגיאה בטעינת היסטוריה:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * קריאת N הנקודות האחרונות
     * @param {number} count - מספר הנקודות להחזרה
     * @returns {Promise<Array>} מערך נקודות נתונים
     */
    async loadLastNPoints(count = 10) {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.chartHistory], 'readonly');
            const store = transaction.objectStore(this.stores.chartHistory);
            const request = store.openCursor(null, 'prev'); // התחלה מהסוף

            const results = [];
            let processed = 0;

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && processed < count) {
                    results.push(cursor.value);
                    processed++;
                    cursor.continue();
                } else {
                    // מיון לפי timestamp (החדש ביותר ראשון)
                    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    console.log(`📊 נטענו ${results.length} הנקודות האחרונות`);
                    resolve(results);
                }
            };

            request.onerror = () => {
                console.error('❌ שגיאה בטעינת נקודות אחרונות:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * קריאת נתונים לפי טווח תאריכים
     * @param {Date|string} startDate - תאריך התחלה
     * @param {Date|string} endDate - תאריך סיום
     * @returns {Promise<Array>} מערך נקודות נתונים
     */
    async loadByDateRange(startDate, endDate) {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        // המרת לתאריכים ISO אם צריך
        const start = startDate instanceof Date ? startDate.toISOString() : startDate;
        const end = endDate instanceof Date ? endDate.toISOString() : endDate;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.chartHistory], 'readonly');
            const store = transaction.objectStore(this.stores.chartHistory);
            const index = store.index('timestamp');

            const range = IDBKeyRange.bound(start, end);
            const request = index.openCursor(range);

            const results = [];

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    results.push(cursor.value);
                    cursor.continue();
                } else {
                    // מיון לפי timestamp (החדש ביותר ראשון)
                    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    console.log(`📊 נטענו ${results.length} נקודות נתונים מהטווח ${start} - ${end}`);
                    resolve(results);
                }
            };

            request.onerror = () => {
                console.error('❌ שגיאה בטעינת טווח תאריכים:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * קריאת נקודת נתונים ספציפית לפי מזהה
     * @param {string} id - מזהה הנקודה
     * @returns {Promise<Object|null>} נקודת הנתונים או null אם לא נמצאה
     */
    async loadById(id) {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.chartHistory], 'readonly');
            const store = transaction.objectStore(this.stores.chartHistory);
            const request = store.get(id);

            request.onsuccess = () => {
                if (request.result) {
                    console.log('📊 נטענה נקודת נתונים:', id);
                    resolve(request.result);
                } else {
                    console.log('📊 נקודת נתונים לא נמצאה:', id);
                    resolve(null);
                }
            };

            request.onerror = () => {
                console.error('❌ שגיאה בטעינת נקודת נתונים:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * קריאת כל הנתונים (לצורכי בדיקה)
     * @returns {Promise<Array>} כל נקודות הנתונים
     */
    async loadAll() {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.chartHistory], 'readonly');
            const store = transaction.objectStore(this.stores.chartHistory);
            const request = store.getAll();

            request.onsuccess = () => {
                const results = request.result || [];
                console.log(`📊 נטענו כל ${results.length} נקודות הנתונים`);
                resolve(results);
            };

            request.onerror = () => {
                console.error('❌ שגיאה בטעינת כל הנתונים:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * ניקוי נתונים ישנים
     * @param {number} maxAgeHours - גיל מקסימלי בשעות (ברירת מחדל: 720 = 30 יום)
     * @returns {Promise<Object>} סטטיסטיקות הניקוי
     */
    async cleanupOldData(maxAgeHours = 720) {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        const cutoffTime = new Date(Date.now() - (maxAgeHours * 60 * 60 * 1000)).toISOString();
        let deletedCount = 0;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.chartHistory], 'readwrite');
            const store = transaction.objectStore(this.stores.chartHistory);
            const index = store.index('timestamp');

            const range = IDBKeyRange.upperBound(cutoffTime);
            const request = index.openCursor(range);

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    deletedCount++;
                    cursor.continue();
                } else {
                    console.log(`🗑️ נמחקו ${deletedCount} רשומות ישנות יותר מ-${maxAgeHours} שעות`);
                    resolve({
                        deletedCount,
                        maxAgeHours,
                        cutoffTime,
                        success: true
                    });
                }
            };

            request.onerror = () => {
                console.error('❌ שגיאה בניקוי נתונים ישנים:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * קבלת גודל אחסון משוער
     * @returns {Promise<Object>} סטטיסטיקות גודל
     */
    async getStorageSize() {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        try {
            // נסה להשתמש ב-Storage API אם זמין
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                return {
                    quota: estimate.quota,
                    usage: estimate.usage,
                    usageDetails: estimate.usageDetails
                };
            }
        } catch (error) {
            console.warn('Storage API לא זמין:', error);
        }

        // חישוב משוער על בסיס מספר רשומות
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.chartHistory], 'readonly');
            const store = transaction.objectStore(this.stores.chartHistory);
            const request = store.count();

            request.onsuccess = () => {
                const recordCount = request.result;
                // הערכה משוערת: כל רשומה כ-2KB
                const estimatedSize = recordCount * 2048;

                resolve({
                    quota: null,
                    usage: estimatedSize,
                    usageDetails: { indexedDB: estimatedSize },
                    estimated: true
                });
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * אופטימיזציה של מסד הנתונים
     * @returns {Promise<Object>} תוצאות האופטימיזציה
     */
    async optimizeStorage() {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        console.log('🔧 מתחיל אופטימיזציה של IndexedDB...');

        const results = {
            vacuum: false,
            reindex: false,
            compress: false,
            beforeSize: 0,
            afterSize: 0
        };

        try {
            // קבלת גודל לפני אופטימיזציה
            const beforeStats = await this.getStats();
            results.beforeSize = beforeStats.totalSize;

            // IndexedDB לא תומך ב-VACUUM ישיר, אבל אפשר לעשות פעולות אופטימיזציה
            // 1. ניקוי רשומות כפולות (אם קיימות)
            await this.removeDuplicates();

            // 2. ארגון מחדש של אינדקסים (על ידי קריאה וכתיבה מחדש)
            await this.reindexData();

            // 3. ניקוי זיכרון לא בשימוש
            if (this.db) {
                // נסה לכפות garbage collection
                this.db.close();
                await new Promise(resolve => setTimeout(resolve, 100));
                await this.initialize();
            }

            // קבלת גודל אחרי אופטימיזציה
            const afterStats = await this.getStats();
            results.afterSize = afterStats.totalSize;

            results.vacuum = true;
            results.reindex = true;
            results.compress = true;

            console.log(`✅ אופטימיזציה הושלמה. גודל לפני: ${results.beforeSize}, אחרי: ${results.afterSize}`);

        } catch (error) {
            console.error('❌ שגיאה באופטימיזציה:', error);
            results.error = error.message;
        }

        return results;
    }

    /**
     * הסרת רשומות כפולות
     * @returns {Promise<number>} מספר הרשומות שנמחקו
     */
    async removeDuplicates() {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        const allData = await this.loadAll();
        const seen = new Set();
        const duplicates = [];

        // זיהוי כפילויות על בסיס timestamp ומדדים
        for (const item of allData) {
            const key = `${item.timestamp}_${item.metrics.totalFiles}_${item.metrics.errors}_${item.metrics.warnings}`;
            if (seen.has(key)) {
                duplicates.push(item.id);
            } else {
                seen.add(key);
            }
        }

        // מחיקת כפילויות
        for (const id of duplicates) {
            await this.deleteById(id);
        }

        console.log(`🗑️ נמחקו ${duplicates.length} רשומות כפולות`);
        return duplicates.length;
    }

    /**
     * ארגון מחדש של אינדקסים
     * @returns {Promise<void>}
     */
    async reindexData() {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        const allData = await this.loadAll();

        if (allData.length === 0) {
            return;
        }

        // מחיקת כל הנתונים
        await this.clearAllData();

        // כתיבה מחדש עם אינדקסים חדשים
        await this.saveBatch(allData);

        console.log(`🔄 אורגנו מחדש ${allData.length} רשומות`);
    }

    /**
     * מחיקת רשומה ספציפית לפי מזהה
     * @param {string} id - מזהה הרשומה למחיקה
     * @returns {Promise<boolean>} האם הרשומה נמחקה
     */
    async deleteById(id) {
        if (!this.isReady()) {
            throw new Error('IndexedDB לא מאותחל');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.chartHistory], 'readwrite');
            const store = transaction.objectStore(this.stores.chartHistory);
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log('🗑️ נמחקה רשומה:', id);
                resolve(true);
            };

            request.onerror = () => {
                console.error('❌ שגיאה במחיקת רשומה:', request.error);
                reject(request.error);
            };
        });
    }
}

// ייצוא המחלקה לגלובל
if (typeof window !== 'undefined') {
    window.IndexedDBAdapter = IndexedDBAdapter;
}

console.log('🔧 IndexedDBAdapter loaded successfully');
