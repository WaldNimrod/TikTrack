/**
 * ========================================
 * Unified Cache Manager - TikTrack
 * ========================================
 * 
 * מנהל מטמון מרכזי לכל שכבות המטמון במערכת
 * 
 * תכונות:
 * - החלטה אוטומטית על שכבה לפי קריטריונים
 * - API אחיד לכל הפעולות
 * - סינכרון אוטומטי בין שכבות
 * - ניהול זיכרון אוטומטי
 * 
 * שכבות מטמון:
 * 1. Frontend Memory - נתונים זמניים (<100KB)
 * 2. localStorage - נתונים פשוטים (<1MB)
 * 3. IndexedDB - נתונים מורכבים (>1MB)
 * 4. Backend Cache - נתונים קריטיים עם TTL
 * 
 * מחבר: TikTrack Development Team
 * תאריך יצירה: 26 בינואר 2025
 * גרסה: 1.0.0
 * ========================================
 */

class UnifiedCacheManager {
    constructor() {
        this.initialized = false;
        this.memoryCache = {};
        this.cache = new Map();
        this.db = null;
        this.hits = 0;
        this.responseTimes = [];
        this.stats = {
            operations: {
                save: 0,
                get: 0,
                remove: 0,
                clear: 0
            },
            layers: {
                memory: { entries: 0, size: 0 },
                localStorage: { entries: 0, size: 0 },
                indexedDB: { entries: 0, size: 0 },
                backend: { entries: 0, size: 0 }
            },
            performance: {
                avgResponseTime: 0,
                hitRate: 0,
                missRate: 0
            }
        };
        
        // מדיניות מטמון ברירת מחדל
        this.defaultPolicies = {
            'user-preferences': { layer: 'localStorage', ttl: null, compress: false },
            'ui-state': { layer: 'localStorage', ttl: 3600000, compress: false },
            'filter-state': { layer: 'localStorage', ttl: 3600000, compress: false },
            'notifications-history': { layer: 'indexedDB', ttl: 86400000, compress: true },
            'file-mappings': { layer: 'indexedDB', ttl: null, compress: true },
            'linter-results': { layer: 'indexedDB', ttl: 86400000, compress: true },
            'js-analysis': { layer: 'indexedDB', ttl: 86400000, compress: true },
            'market-data': { layer: 'backend', ttl: 30000, compress: false },
            'trade-data': { layer: 'backend', ttl: 30000, compress: false },
            'dashboard-data': { layer: 'backend', ttl: 300000, compress: false }
        };
        
        // ממשקי שכבות מטמון
        this.layers = {
            memory: new MemoryLayer(),
            localStorage: new LocalStorageLayer(),
            indexedDB: null, // יאותחל מאוחר יותר
            backend: new BackendCacheLayer()
        };
    }

    /**
     * אתחול מערכת המטמון המאוחדת
     * @returns {Promise<boolean>} הצלחת האתחול
     */
    async initialize() {
        try {
            // console.log('🔄 Initializing Unified Cache Manager...');
            
            // אתחול IndexedDB
            if (window.indexedDB) {
                this.layers.indexedDB = new IndexedDBLayer();
                await this.layers.indexedDB.initialize();
            } else {
                console.warn('⚠️ IndexedDB not available, using localStorage fallback');
                this.layers.indexedDB = new LocalStorageLayer();
            }
            
            // אתחול שכבות אחרות
            await this.layers.memory.initialize();
            await this.layers.localStorage.initialize();
            await this.layers.backend.initialize();
            
            // טעינת סטטיסטיקות
            await this.updateStats();
            
            this.initialized = true;
            // console.log('✅ Unified Cache Manager initialized successfully');
            
            // הודעת הצלחה - מועברת להודעה סופית
            // if (window.notificationSystem) {
            //     window.notificationSystem.showNotification(
            //         'מערכת מטמון מאוחדת אותחלה בהצלחה',
            //         'success'
            //     );
            // }
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Unified Cache Manager:', error);
            
            // הודעת שגיאה
            if (window.notificationSystem) {
                window.notificationSystem.showNotification(
                    'שגיאה באתחול מערכת מטמון מאוחדת',
                    'error'
                );
            }
            
            return false;
        }
    }

    /**
     * שמירת נתונים במטמון עם החלטה אוטומטית על שכבה
     * @param {string} key - מפתח הנתונים
     * @param {any} data - הנתונים לשמירה
     * @param {Object} options - אפשרויות נוספות
     * @returns {Promise<boolean>} הצלחת השמירה
     */
    async save(key, data, options = {}) {
        if (!this.initialized) {
            console.warn('⚠️ Unified Cache Manager not initialized');
            return false;
        }

        const startTime = performance.now();
        
        try {
            // קבלת מדיניות מטמון
            const policy = this.getPolicy(key, options);
            
            // בחירת שכבה אוטומטית
            const layer = this.selectLayer(data, policy);
            
            // הכנת נתונים
            const preparedData = await this.prepareData(data, policy);
            
            // שמירה בשכבה הנבחרת
            const result = await this.layers[layer].save(key, preparedData, policy);
            
            // עדכון סטטיסטיקות
            if (!this.stats) {
                this.stats = {
                    operations: { save: 0, get: 0, remove: 0, clear: 0 },
                    layers: { memory: { entries: 0, size: 0 }, localStorage: { entries: 0, size: 0 }, indexedDB: { entries: 0, size: 0 }, backend: { entries: 0, size: 0 } },
                    performance: { avgResponseTime: 0, totalRequests: 0, successfulRequests: 0 }
                };
            }
            this.stats.operations.save++;
            this.stats.layers[layer].entries++;
            
            // סינכרון עם Backend אם נדרש (זמנית מושבת עד ש-API יהיה מוכן)
            // if (policy.syncToBackend && layer !== 'backend') {
            //     await this.syncToBackend(key, preparedData, policy);
            // }
            
            const responseTime = performance.now() - startTime;
            this.updatePerformanceStats(responseTime, true);
            
                // console.log(`✅ Saved ${key} to ${layer} layer (${responseTime.toFixed(2)}ms)`);
            return result;
            
        } catch (error) {
            console.error(`❌ Failed to save ${key}:`, error);
            this.updatePerformanceStats(performance.now() - startTime, false);
            return false;
        }
    }

    /**
     * קבלת נתונים מהמטמון
     * @param {string} key - מפתח הנתונים
     * @param {Object} options - אפשרויות נוספות
     * @returns {Promise<any>} הנתונים או null
     */
    async get(key, options = {}) {
        if (!this.initialized) {
            console.warn('⚠️ Unified Cache Manager not initialized');
            return options.fallback ? await options.fallback() : null;
        }

        const startTime = performance.now();
        
        try {
            // חיפוש בכל השכבות לפי סדר עדיפות
            const searchOrder = ['memory', 'localStorage', 'indexedDB', 'backend'];
            
            for (const layer of searchOrder) {
                if (this.layers[layer]) {
                    const data = await this.layers[layer].get(key, options);
                    if (data !== null) {
                        // עדכון סטטיסטיקות
                        this.stats.operations.get++;
                        this.stats.layers[layer].entries++;
                        
                        const responseTime = performance.now() - startTime;
                        this.updatePerformanceStats(responseTime, true);
                        
                        // console.log(`✅ Retrieved ${key} from ${layer} layer (${responseTime.toFixed(2)}ms)`);
                        return data;
                    }
                }
            }
            
            // אם לא נמצא, נסה fallback
            if (options.fallback) {
                console.log(`⚠️ Key ${key} not found, using fallback`);
                const fallbackData = await options.fallback();
                
                // שמור את הנתונים מהשירות למטמון
                if (fallbackData !== null) {
                    await this.save(key, fallbackData, options);
                }
                
                return fallbackData;
            }
            
            const responseTime = performance.now() - startTime;
            this.updatePerformanceStats(responseTime, false);
            
            console.log(`❌ Key ${key} not found in any layer`);
            return null;
            
        } catch (error) {
            console.error(`❌ Failed to get ${key}:`, error);
            this.updatePerformanceStats(performance.now() - startTime, false);
            return options.fallback ? await options.fallback() : null;
        }
    }

    /**
     * הסרת נתונים מהמטמון
     * @param {string} key - מפתח הנתונים
     * @param {Object} options - אפשרויות נוספות
     * @returns {Promise<boolean>} הצלחת ההסרה
     */
    async remove(key, options = {}) {
        if (!this.initialized) {
            console.warn('⚠️ Unified Cache Manager not initialized');
            return false;
        }

        try {
            let removed = false;
            
            // הסרה מכל השכבות
            for (const [layerName, layer] of Object.entries(this.layers)) {
                if (layer && layer.remove) {
                    const result = await layer.remove(key, options);
                    if (result) {
                        removed = true;
                        this.stats.layers[layerName].entries = Math.max(0, this.stats.layers[layerName].entries - 1);
                    }
                }
            }
            
            this.stats.operations.remove++;
            
            if (removed) {
                console.log(`✅ Removed ${key} from cache`);
            } else {
                console.log(`⚠️ Key ${key} not found for removal`);
            }
            
            return removed;
            
        } catch (error) {
            console.error(`❌ Failed to remove ${key}:`, error);
            return false;
        }
    }

    /**
     * ניקוי מטמון לפי סוג
     * @param {string} type - סוג המטמון (memory|localStorage|indexedDB|backend|all)
     * @param {Object} options - אפשרויות נוספות
     * @returns {Promise<boolean>} הצלחת הניקוי
     */
    async clear(type = 'all', options = {}) {
        if (!this.initialized) {
            console.warn('⚠️ Unified Cache Manager not initialized');
            return false;
        }

        try {
            let cleared = false;
            
            if (type === 'all') {
                // ניקוי כל השכבות
                for (const [layerName, layer] of Object.entries(this.layers)) {
                    if (layer && layer.clear) {
                        const result = await layer.clear(options);
                        if (result) {
                            cleared = true;
                            this.stats.layers[layerName].entries = 0;
                            this.stats.layers[layerName].size = 0;
                        }
                    }
                }
            } else if (this.layers[type] && this.layers[type].clear) {
                // ניקוי שכבה ספציפית
                const result = await this.layers[type].clear(options);
                if (result) {
                    cleared = true;
                    this.stats.layers[type].entries = 0;
                    this.stats.layers[type].size = 0;
                }
            }
            
            this.stats.operations.clear++;
            
            if (cleared) {
                console.log(`✅ Cleared ${type} cache`);
                
                // הודעת הצלחה
                if (window.notificationSystem) {
                    window.notificationSystem.showNotification(
                        `מטמון ${type} נוקה בהצלחה`,
                        'success'
                    );
                }
            }
            
            return cleared;
            
        } catch (error) {
            console.error(`❌ Failed to clear ${type} cache:`, error);
            return false;
        }
    }

    /**
     * קבלת סטטיסטיקות מטמון
     * @returns {Object} סטטיסטיקות מפורטות
     */
    getStats() {
        return {
            ...this.stats,
            initialized: this.initialized,
            layers: this.stats.layers || {
                memory: { entries: 0, size: 0 },
                localStorage: { entries: 0, size: 0 },
                indexedDB: { entries: 0, size: 0 },
                backend: { entries: 0, size: 0 }
            },
            performance: this.stats.performance || {
                avgResponseTime: 0,
                hitRate: 0
            },
            operations: this.stats.operations || {
                get: 0,
                set: 0,
                delete: 0,
                hits: 0,
                misses: 0
            }
        };
    }

    /**
     * בחירת שכבה אוטומטית לפי קריטריונים
     * @param {any} data - הנתונים
     * @param {Object} policy - מדיניות מטמון
     * @returns {string} שם השכבה
     */
    selectLayer(data, policy) {
        // אם מדיניות מגדירה שכבה ספציפית
        if (policy.layer) {
            return policy.layer;
        }
        
        // בחירה אוטומטית לפי גודל ומורכבות
        const dataSize = this.calculateDataSize(data);
        const isComplex = this.isComplexData(data);
        
        if (dataSize < 100 * 1024) { // < 100KB
            return 'memory';
        } else if (dataSize < 1024 * 1024 && !isComplex) { // < 1MB ופשוט
            return 'localStorage';
        } else if (dataSize >= 1024 * 1024 || isComplex) { // >= 1MB או מורכב
            return 'indexedDB';
        }
        
        return 'localStorage'; // ברירת מחדל
    }

    /**
     * קבלת מדיניות מטמון
     * @param {string} key - מפתח הנתונים
     * @param {Object} options - אפשרויות נוספות
     * @returns {Object} מדיניות מטמון
     */
    getPolicy(key, options) {
        // חיפוש מדיניות לפי מפתח
        for (const [pattern, policy] of Object.entries(this.defaultPolicies)) {
            if (key.includes(pattern)) {
                return { ...policy, ...options };
            }
        }
        
        // מדיניות ברירת מחדל
        return {
            layer: null, // בחירה אוטומטית
            ttl: 3600000, // שעה
            compress: false,
            syncToBackend: false,
            ...options
        };
    }

    /**
     * הכנת נתונים לשמירה
     * @param {any} data - הנתונים
     * @param {Object} policy - מדיניות מטמון
     * @returns {any} הנתונים המוכנים
     */
    async prepareData(data, policy) {
        let preparedData = data;
        
        // דחיסה אם נדרש
        if (policy.compress && this.isComplexData(data)) {
            preparedData = await this.compressData(data);
        }
        
        // הוספת metadata
        if (typeof preparedData === 'object' && preparedData !== null) {
            preparedData._cacheMeta = {
                timestamp: Date.now(),
                ttl: policy.ttl,
                compressed: policy.compress
            };
        }
        
        return preparedData;
    }

    /**
     * חישוב גודל נתונים
     * @param {any} data - הנתונים
     * @returns {number} גודל בבייטים
     */
    calculateDataSize(data) {
        try {
            return new Blob([JSON.stringify(data)]).size;
        } catch (error) {
            return 0;
        }
    }

    /**
     * בדיקה אם נתונים מורכבים
     * @param {any} data - הנתונים
     * @returns {boolean} האם מורכבים
     */
    isComplexData(data) {
        if (Array.isArray(data) && data.length > 100) return true;
        if (typeof data === 'object' && data !== null) {
            const keys = Object.keys(data);
            return keys.length > 50 || keys.some(key => typeof data[key] === 'object');
        }
        return false;
    }

    /**
     * דחיסת נתונים
     * @param {any} data - הנתונים
     * @returns {any} הנתונים הדחוסים
     */
    async compressData(data) {
        // דחיסה פשוטה - הסרת רווחים מיותרים
        try {
            const jsonString = JSON.stringify(data);
            return jsonString.replace(/\s+/g, ' ').trim();
        } catch (error) {
            console.warn('⚠️ Failed to compress data:', error);
            return data;
        }
    }

    /**
     * סינכרון עם Backend
     * @param {string} key - מפתח הנתונים
     * @param {any} data - הנתונים
     * @param {Object} policy - מדיניות מטמון
     */
    async syncToBackend(key, data, policy) {
        try {
            if (window.CacheSyncManager) {
                await window.CacheSyncManager.syncToBackend(key, data, policy);
            }
        } catch (error) {
            console.warn(`⚠️ Failed to sync ${key} to backend:`, error);
        }
    }

    /**
     * עדכון סטטיסטיקות ביצועים
     * @param {number} responseTime - זמן תגובה
     * @param {boolean} hit - האם פגיעה
     */
    updatePerformanceStats(responseTime, hit) {
        const totalOps = this.stats.operations.save + this.stats.operations.get;
        const currentAvg = this.stats.performance.avgResponseTime;
        
        // עדכון ממוצע זמן תגובה
        this.stats.performance.avgResponseTime = 
            (currentAvg * (totalOps - 1) + responseTime) / totalOps;
        
        // עדכון שיעור פגיעות
        if (hit) {
            this.stats.performance.hitRate = 
                ((this.stats.performance.hitRate * (totalOps - 1)) + 1) / totalOps;
        } else {
            this.stats.performance.hitRate = 
                (this.stats.performance.hitRate * (totalOps - 1)) / totalOps;
        }
        
        this.stats.performance.missRate = 1 - this.stats.performance.hitRate;
    }

    /**
     * עדכון סטטיסטיקות שכבות
     */
    async updateStats() {
        try {
            // אתחול stats אם לא מאותחל
            if (!this.stats) {
                this.stats = {
                    operations: {
                        save: 0,
                        get: 0,
                        remove: 0,
                        clear: 0
                    },
                    layers: {
                        memory: { entries: 0, size: 0 },
                        localStorage: { entries: 0, size: 0 },
                        indexedDB: { entries: 0, size: 0 },
                        backend: { entries: 0, size: 0 }
                    },
                    performance: {
                        avgResponseTime: 0,
                        totalRequests: 0,
                        successfulRequests: 0
                    }
                };
            }
            
            for (const [layerName, layer] of Object.entries(this.layers)) {
                if (layer && layer.getStats) {
                    const layerStats = await layer.getStats();
                    this.stats.layers[layerName] = {
                        entries: layerStats.entries || 0,
                        size: layerStats.size || 0
                    };
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to update layer stats:', error);
        }
    }
}

/**
 * Memory Layer - שכבה 1: נתונים זמניים
 */
class MemoryLayer {
    constructor() {
        this.cache = new Map();
        this.maxSize = 100 * 1024; // 100KB
    }

    async initialize() {
        this.cache.clear();
                // console.log('✅ Memory Layer initialized');
    }

    async save(key, data, policy) {
        this.cache.set(key, data);
        return true;
    }

    async get(key, options) {
        return this.cache.get(key) || null;
    }

    async remove(key, options) {
        return this.cache.delete(key);
    }

    async clear(options) {
        this.cache.clear();
        return true;
    }

    getStats() {
        return {
            entries: this.cache.size,
            size: this.maxSize
        };
    }
}

/**
 * LocalStorage Layer - שכבה 2: נתונים פשוטים
 */
class LocalStorageLayer {
    constructor() {
        this.prefix = 'tiktrack_';
    }

    async initialize() {
                // console.log('✅ LocalStorage Layer initialized');
    }

    async save(key, data, policy) {
        try {
            const fullKey = this.prefix + key;
            const value = JSON.stringify(data);
            localStorage.setItem(fullKey, value);
            return true;
        } catch (error) {
            console.error('❌ LocalStorage save failed:', error);
            return false;
        }
    }

    async get(key, options) {
        try {
            const fullKey = this.prefix + key;
            const value = localStorage.getItem(fullKey);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('❌ LocalStorage get failed:', error);
            return null;
        }
    }

    async remove(key, options) {
        try {
            const fullKey = this.prefix + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error('❌ LocalStorage remove failed:', error);
            return false;
        }
    }

    async clear(options) {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('❌ LocalStorage clear failed:', error);
            return false;
        }
    }

    getStats() {
        try {
            let entries = 0;
            let size = 0;
            
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    entries++;
                    size += localStorage.getItem(key).length;
                }
            });
            
            return { entries, size };
        } catch (error) {
            return { entries: 0, size: 0 };
        }
    }
}

/**
 * IndexedDB Layer - שכבה 3: נתונים מורכבים
 */
class IndexedDBLayer {
    constructor() {
        this.db = null;
    }

    async initialize() {
        if (window.indexedDB) {
            // Create database instance
            return new Promise((resolve, reject) => {
                const request = window.indexedDB.open('UnifiedCacheDB', 2);
                
                request.onerror = () => {
                    console.error('❌ IndexedDB open failed');
                    reject(request.error);
                };
                
                request.onsuccess = () => {
                    this.db = request.result;
                    // console.log('✅ IndexedDB Layer initialized');
                    resolve(true);
                };
                
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('unified-cache')) {
                        const store = db.createObjectStore('unified-cache', { keyPath: 'key' });
                        store.createIndex('timestamp', 'timestamp', { unique: false });
                        console.log('✅ IndexedDB object store created');
                    }
                };
            });
        }
        console.warn('⚠️ IndexedDB not available');
        return false;
    }

    async save(key, data, policy) {
        try {
            if (this.db) {
                const transaction = this.db.transaction(['unified-cache'], 'readwrite');
                const store = transaction.objectStore('unified-cache');
                const request = store.put({ key, data, timestamp: Date.now() });
                return new Promise((resolve, reject) => {
                    request.onsuccess = () => resolve(true);
                    request.onerror = () => reject(request.error);
                });
            }
            return false;
        } catch (error) {
            console.error('❌ IndexedDB save failed:', error);
            return false;
        }
    }

    async get(key, options) {
        try {
            if (this.db) {
                const transaction = this.db.transaction(['unified-cache'], 'readonly');
                const store = transaction.objectStore('unified-cache');
                const request = store.get(key);
                return new Promise((resolve, reject) => {
                    request.onsuccess = () => resolve(request.result?.data || null);
                    request.onerror = () => reject(request.error);
                });
            }
            return null;
        } catch (error) {
            console.error('❌ IndexedDB get failed:', error);
            return null;
        }
    }

    async remove(key, options) {
        try {
            if (this.db) {
                const transaction = this.db.transaction(['unified-cache'], 'readwrite');
                const store = transaction.objectStore('unified-cache');
                const request = store.delete(key);
                return new Promise((resolve, reject) => {
                    request.onsuccess = () => resolve(true);
                    request.onerror = () => reject(request.error);
                });
            }
            return false;
        } catch (error) {
            console.error('❌ IndexedDB remove failed:', error);
            return false;
        }
    }

    async clear(options) {
        try {
            if (this.db) {
                const transaction = this.db.transaction(['unified-cache'], 'readwrite');
                const store = transaction.objectStore('unified-cache');
                const request = store.clear();
                return new Promise((resolve, reject) => {
                    request.onsuccess = () => resolve(true);
                    request.onerror = () => reject(request.error);
                });
            }
            return false;
        } catch (error) {
            console.error('❌ IndexedDB clear failed:', error);
            return false;
        }
    }

    async getStats() {
        try {
            if (this.db) {
                const transaction = this.db.transaction(['unified-cache'], 'readonly');
                const store = transaction.objectStore('unified-cache');
                const request = store.count();
                return new Promise((resolve, reject) => {
                    request.onsuccess = () => resolve({ entries: request.result, size: 0 });
                    request.onerror = () => reject(request.error);
                });
            }
            return { entries: 0, size: 0 };
        } catch (error) {
            return { entries: 0, size: 0 };
        }
    }
}

/**
 * Backend Cache Layer - שכבה 4: נתונים קריטיים
 */
class BackendCacheLayer {
    constructor() {
        this.cache = new Map();
    }

    async initialize() {
        this.cache.clear();
                // console.log('✅ Backend Cache Layer initialized');
    }

    async save(key, data, policy) {
        try {
            this.cache.set(key, {
                data,
                timestamp: Date.now(),
                ttl: policy.ttl
            });
            return true;
        } catch (error) {
            console.error('❌ Backend Cache save failed:', error);
            return false;
        }
    }

    async get(key, options) {
        try {
            const entry = this.cache.get(key);
            if (!entry) return null;
            
            // בדיקת TTL
            if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
                return null;
            }
            
            return entry.data;
        } catch (error) {
            console.error('❌ Backend Cache get failed:', error);
            return null;
        }
    }

    async remove(key, options) {
        try {
            return this.cache.delete(key);
        } catch (error) {
            console.error('❌ Backend Cache remove failed:', error);
            return false;
        }
    }

    async clear(options) {
        try {
            this.cache.clear();
            return true;
        } catch (error) {
            console.error('❌ Backend Cache clear failed:', error);
            return false;
        }
    }

    getStats() {
        return {
            entries: this.cache.size,
            size: 0 // לא ניתן לחשב בקליינט
        };
    }


    /**
     * Initialize IndexedDB
     */
    async initializeIndexedDB() {
        return new Promise((resolve, reject) => {
            try {
                const request = indexedDB.open('UnifiedCacheDB', 2);
                
                request.onerror = (event) => {
                    console.warn('⚠️ IndexedDB not available:', event.target.error);
                    resolve(); // Continue without IndexedDB
                };
                
                request.onupgradeneeded = (event) => {
                    try {
                        const db = event.target.result;
                        if (!db.objectStoreNames.contains('unified-cache')) {
                            db.createObjectStore('unified-cache', { keyPath: 'key' });
                        }
                    } catch (upgradeError) {
                        console.error('❌ Error during IndexedDB upgrade:', upgradeError);
                        reject(upgradeError);
                    }
                };
                
                request.onsuccess = () => {
                    try {
                        this.db = request.result;
                        console.log('✅ IndexedDB initialized');
                        resolve();
                    } catch (successError) {
                        console.error('❌ Error after IndexedDB success:', successError);
                        reject(successError);
                    }
                };
                
            } catch (error) {
                console.error('❌ Error opening IndexedDB:', error);
                reject(error);
            }
        });
    }

    /**
     * Load data from localStorage
     */
    loadFromLocalStorage() {
        try {
            const keys = Object.keys(localStorage);
            let count = 0;
            let size = 0;
            
            keys.forEach(key => {
                if (key.startsWith('unified-cache-')) {
                    count++;
                    size += localStorage.getItem(key).length;
                }
            });
            
            // Initialize stats if not already initialized
            if (!this.stats) {
                this.stats = {
                    layers: {
                        memory: { entries: 0, size: 0 },
                        localStorage: { entries: 0, size: 0 },
                        indexedDB: { entries: 0, size: 0 },
                        backend: { entries: 0, size: 0 }
                    },
                    performance: {
                        avgResponseTime: 0,
                        hitRate: 0
                    },
                    operations: {
                        get: 0,
                        set: 0,
                        delete: 0,
                        hits: 0,
                        misses: 0
                    }
                };
            }
            
            this.stats.layers.localStorage.entries = count;
            this.stats.layers.localStorage.size = size;
            
        } catch (error) {
            console.warn('⚠️ Could not load from localStorage:', error.message || error);
            // Continue with empty state
            if (this.stats && this.stats.layers) {
                this.stats.layers.localStorage.entries = 0;
                this.stats.layers.localStorage.size = 0;
            }
        }
    }

    /**
     * Update statistics
     */
    updateStats() {
        try {
            // Initialize stats if not already initialized
            if (!this.stats) {
                this.stats = {
                    layers: {
                        memory: { entries: 0, size: 0 },
                        localStorage: { entries: 0, size: 0 },
                        indexedDB: { entries: 0, size: 0 },
                        backend: { entries: 0, size: 0 }
                    },
                    performance: {
                        avgResponseTime: 0,
                        hitRate: 0
                    },
                    operations: {
                        get: 0,
                        set: 0,
                        delete: 0,
                        hits: 0,
                        misses: 0
                    }
                };
            }
            
            // Initialize memoryCache if not already initialized
            if (!this.memoryCache) {
                this.memoryCache = {};
            }
            
            // Update memory stats
            this.stats.layers.memory.entries = Object.keys(this.memoryCache).length;
            this.stats.layers.memory.size = JSON.stringify(this.memoryCache).length;
            
            // Update performance stats
            this.stats.performance.avgResponseTime = this.calculateAvgResponseTime();
            this.stats.performance.hitRate = this.calculateHitRate();
        } catch (error) {
            console.warn('⚠️ Error updating stats:', error);
            // Continue with basic stats
            if (!this.stats) {
                this.stats = {
                    layers: {
                        memory: { entries: 0, size: 0 },
                        localStorage: { entries: 0, size: 0 },
                        indexedDB: { entries: 0, size: 0 },
                        backend: { entries: 0, size: 0 }
                    },
                    performance: {
                        avgResponseTime: 0,
                        hitRate: 0
                    },
                    operations: {
                        get: 0,
                        set: 0,
                        delete: 0,
                        hits: 0,
                        misses: 0
                    }
                };
            }
        }
    }

    /**
     * Calculate average response time
     */
    calculateAvgResponseTime() {
        try {
            if (!this.responseTimes || this.responseTimes.length === 0) return 0;
            return this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
        } catch (error) {
            console.warn('⚠️ Error calculating average response time:', error);
            return 0;
        }
    }

    /**
     * Calculate hit rate
     */
    calculateHitRate() {
        try {
            if (!this.stats || !this.stats.operations || !this.stats.operations.get) return 0;
            const total = this.stats.operations.get;
            if (total === 0) return 0;
            return (this.hits / total) * 100;
        } catch (error) {
            console.warn('⚠️ Error calculating hit rate:', error);
            return 0;
        }
    }
}

// יצירת instance גלובלי
window.UnifiedCacheManager = new UnifiedCacheManager();


// הוספה למערכת האתחול המאוחדת
if (window.UnifiedInitializationSystem) {
    window.UnifiedInitializationSystem.addCoreSystem('UnifiedCacheManager', () => {
        return window.UnifiedCacheManager.initialize();
    });
}

// ===== COMPLETE CACHE CLEARING SYSTEM =====

/**
 * Complete cache clearing process - clears all layers and provides detailed feedback
 * @param {Object} options - Options for clearing
 * @returns {Promise<Object>} Result with success status and details
 */
UnifiedCacheManager.prototype.clearAllCache = async function(options = {}) {
    try {
        console.log('🔄 Starting complete cache clearing process...');
        
        const clearedLayers = [];
        const errors = [];
        
        // 1. Clear Unified Cache Manager (all layers)
        try {
            await this.clear('all');
            clearedLayers.push('Unified Cache (all layers)');
            console.log('✅ Unified Cache cleared successfully');
        } catch (error) {
            console.error('❌ Error clearing Unified Cache:', error);
            errors.push(`Unified Cache: ${error.message}`);
        }
        
        // 2. Clear localStorage
        try {
            localStorage.clear();
            clearedLayers.push('localStorage');
            console.log('✅ localStorage cleared successfully');
        } catch (error) {
            console.error('❌ Error clearing localStorage:', error);
            errors.push(`localStorage: ${error.message}`);
        }
        
        // 3. Clear sessionStorage
        try {
            sessionStorage.clear();
            clearedLayers.push('sessionStorage');
            console.log('✅ sessionStorage cleared successfully');
        } catch (error) {
            console.error('❌ Error clearing sessionStorage:', error);
            errors.push(`sessionStorage: ${error.message}`);
        }
        
        // 4. Clear IndexedDB CACHE ONLY (NOT HISTORICAL DATA)
        if ('indexedDB' in window) {
            try {
                // Only clear cache-related databases, NOT historical data
                const cacheOnlyDatabases = ['unified-cache', 'tiktrack-cache']; // Only cache databases
                const historicalDatabases = ['tiktrack-data', 'notifications-history', 'file-mappings', 'linter-results', 'js-analysis']; // Historical data - DO NOT DELETE
                
                console.log('🔄 Clearing IndexedDB cache only (preserving historical data)...');
                
                // Clear only cache databases
                for (const dbName of cacheOnlyDatabases) {
                    try {
                        await new Promise((resolve) => {
                            const openReq = indexedDB.open(dbName);
                            openReq.onsuccess = () => {
                                const db = openReq.result;
                                
                                // Check if database has any object stores
                                if (db.objectStoreNames.length === 0) {
                                    console.log(`ℹ️ Database ${dbName} has no object stores, skipping`);
                                    db.close();
                                    resolve();
                                    return;
                                }
                                
                                const transaction = db.transaction(db.objectStoreNames, 'readwrite');
                                
                                // Clear all object stores in cache databases only
                                for (let i = 0; i < db.objectStoreNames.length; i++) {
                                    const storeName = db.objectStoreNames[i];
                                    const store = transaction.objectStore(storeName);
                                    const clearReq = store.clear();
                                    clearReq.onsuccess = () => {
                                        console.log(`✅ Cleared cache object store: ${dbName}.${storeName}`);
                                    };
                                    clearReq.onerror = () => {
                                        console.warn(`⚠️ Failed to clear cache object store: ${dbName}.${storeName}`, clearReq.error);
                                    };
                                }
                                
                                transaction.oncomplete = () => {
                                    db.close();
                                    resolve();
                                };
                                transaction.onerror = () => {
                                    console.warn(`⚠️ Transaction failed for cache database ${dbName}`, transaction.error);
                                    db.close();
                                    resolve();
                                };
                            };
                            openReq.onerror = () => {
                                console.warn(`⚠️ Could not open cache database: ${dbName}`, openReq.error);
                                resolve();
                            };
                        });
                    } catch (error) {
                        console.warn(`⚠️ Error clearing cache data from ${dbName}:`, error);
                    }
                }
                
                // Log preserved historical databases
                console.log(`✅ Preserved historical data in IndexedDB: ${historicalDatabases.join(', ')}`);
                
                clearedLayers.push('IndexedDB Cache (historical data preserved)');
            } catch (error) {
                console.error('❌ Error clearing IndexedDB cache:', error);
                errors.push(`IndexedDB Cache: ${error.message}`);
            }
        }
        
        // 5. Clear Browser Cache
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
                clearedLayers.push('Browser Cache');
                console.log('✅ Browser Cache cleared successfully');
            } catch (error) {
                console.error('❌ Error clearing Browser Cache:', error);
                errors.push(`Browser Cache: ${error.message}`);
            }
        }
        
        // 6. Clear specific cache keys
        const cacheKeys = [
            'user-preferences', 'ui-state', 'filter-state', 'notifications-history',
            'file-mappings', 'linter-results', 'js-analysis', 'market-data',
            'trade-data', 'dashboard-data'
        ];
        
        try {
            cacheKeys.forEach(key => {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
            });
            clearedLayers.push('Specific Cache Keys');
            console.log('✅ Specific cache keys cleared successfully');
        } catch (error) {
            console.error('❌ Error clearing specific cache keys:', error);
            errors.push(`Cache Keys: ${error.message}`);
        }
        
        // 7. Garbage Collection
        if (window.gc && typeof window.gc === 'function') {
            try {
                window.gc();
                clearedLayers.push('Garbage Collection');
                console.log('✅ Garbage Collection executed successfully');
            } catch (error) {
                console.warn('⚠️ Garbage Collection failed:', error);
            }
        }
        
        // 8. Clear notification cache
        if (window.notificationCache && typeof window.notificationCache.clear === 'function') {
            try {
                window.notificationCache.clear();
                clearedLayers.push('Notification Cache');
                console.log('✅ Notification Cache cleared successfully');
            } catch (error) {
                console.warn('⚠️ Notification Cache clear failed:', error);
            }
        }
        
        // 9. Clear preferences cache
        if (window.preferencesCache && typeof window.preferencesCache.clear === 'function') {
            try {
                await window.preferencesCache.clear();
                clearedLayers.push('Preferences Cache');
                console.log('✅ Preferences Cache cleared successfully');
            } catch (error) {
                console.warn('⚠️ Preferences Cache clear failed:', error);
            }
        }
        
        // 10. Refresh data from backend database
        try {
            console.log('🔄 Refreshing data from backend database...');
            await this.refreshDataFromBackend();
            clearedLayers.push('Data Refresh from Backend');
            console.log('✅ Data refreshed from backend successfully');
        } catch (error) {
            console.warn('⚠️ Failed to refresh data from backend:', error);
            errors.push(`Data Refresh: ${error.message}`);
        }
        
        // Update stats after clearing
        await this.updateStats();
        
        console.log('✅ Complete cache clearing process finished');
        return { success: true, clearedLayers, errors };
        
    } catch (error) {
        console.error('❌ Complete cache clearing process failed:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Quick cache clearing for development - simple notification and auto-refresh
 * @param {Object} options - Options for clearing
 * @returns {Promise<Object>} Result with success status
 */
UnifiedCacheManager.prototype.clearAllCacheQuick = async function(options = {}) {
    try {
        console.log('🧹 Quick cache clearing for development...');
        
        const result = await this.clearAllCache(options);
        
        if (result.success) {
            // Show simple success notification
            if (typeof window.showNotification === 'function') {
                window.showNotification(
                    'ניקוי מטמון הושלם בהצלחה',
                    'success',
                    'ניקוי מטמון',
                    3000,
                    'development'
                );
            }
            
            // Auto-refresh after 1.5 seconds
            if (options.autoRefresh !== false) {
                setTimeout(() => {
                    window.location.reload(true);
                }, 1500);
            }
            
            console.log('✅ Quick cache clearing completed - auto-refresh in 1.5 seconds');
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ Quick cache clearing failed:', error);
        
        if (typeof window.showNotification === 'function') {
            window.showNotification(
                `שגיאה בניקוי מטמון: ${error.message}`,
                'error',
                'שגיאה',
                5000,
                'development'
            );
        }
        
        return { success: false, error: error.message };
    }
};

/**
 * Detailed cache clearing with comprehensive feedback
 * @param {Object} options - Options for clearing
 * @returns {Promise<Object>} Result with success status and detailed feedback
 */
UnifiedCacheManager.prototype.clearAllCacheDetailed = async function(options = {}) {
    try {
        console.log('🔄 Starting detailed cache clearing process...');
        
        const result = await this.clearAllCache(options);
        
        if (result.success) {
            // Prepare detailed result message
            let resultMessage = '';
            if (result.clearedLayers.length > 0) {
                resultMessage = `ניקוי מטמון הושלם בהצלחה!\n\nנוקו שכבות:\n• ${result.clearedLayers.join('\n• ')}`;
            }
            
            if (result.errors.length > 0) {
                resultMessage += `\n\nשגיאות:\n• ${result.errors.join('\n• ')}`;
            }
            
            // Show detailed success notification
            if (typeof window.showNotification === 'function') {
                window.showNotification(
                    resultMessage || 'ניקוי מטמון הושלם',
                    'success',
                    'ניקוי מטמון מלא',
                    10000,
                    'system'
                );
            }
        } else {
            // Show error notification
            if (typeof window.showNotification === 'function') {
                window.showNotification(
                    `שגיאה בניקוי מטמון: ${result.error}`,
                    'error',
                    'שגיאה',
                    8000,
                    'system'
                );
            }
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ Detailed cache clearing failed:', error);
        
        if (typeof window.showNotification === 'function') {
            window.showNotification(
                `שגיאה בניקוי מטמון: ${error.message}`,
                'error',
                'שגיאה',
                8000,
                'system'
            );
        }
        
        return { success: false, error: error.message };
    }
};

/**
 * Complete cache verification process - scan, clear, and verify
 * @param {Object} options - Options for the process
 * @returns {Promise<Object>} Complete verification report
 */
UnifiedCacheManager.prototype.verifyCacheSystem = async function(options = {}) {
    try {
        console.log('🔍 Starting complete cache verification process...');
        
        const report = {
            timestamp: new Date().toISOString(),
            phases: {
                preScan: null,
                clearing: null,
                postScan: null,
                verification: null
            },
            summary: {
                totalKeysBefore: 0,
                totalKeysAfter: 0,
                clearedKeys: 0,
                verificationPassed: false,
                errors: []
            }
        };
        
        // Phase 1: Pre-clearing scan
        console.log('📊 Phase 1: Scanning cache layers before clearing...');
        report.phases.preScan = await this.scanAllCacheLayers();
        report.summary.totalKeysBefore = this.countTotalKeys(report.phases.preScan);
        
        // Phase 2: Clear all cache
        console.log('🧹 Phase 2: Clearing all cache layers...');
        const clearResult = await this.clearAllCache(options);
        report.phases.clearing = clearResult;
        
        // Phase 3: Post-clearing scan
        console.log('📊 Phase 3: Scanning cache layers after clearing...');
        report.phases.postScan = await this.scanAllCacheLayers();
        report.summary.totalKeysAfter = this.countTotalKeys(report.phases.postScan);
        report.summary.clearedKeys = report.summary.totalKeysBefore - report.summary.totalKeysAfter;
        
        // Phase 4: Verification and test data insertion
        console.log('✅ Phase 4: Verifying cache system functionality...');
        report.phases.verification = await this.verifyCacheFunctionality();
        report.summary.verificationPassed = report.phases.verification.success;
        
        // Update stats
        await this.updateStats();
        
        console.log('✅ Complete cache verification process finished');
        return report;
        
    } catch (error) {
        console.error('❌ Cache verification process failed:', error);
        return {
            timestamp: new Date().toISOString(),
            success: false,
            error: error.message,
            summary: { verificationPassed: false, errors: [error.message] }
        };
    }
};

/**
 * Scan all cache layers and return detailed information
 * @returns {Promise<Object>} Detailed scan results
 */
UnifiedCacheManager.prototype.scanAllCacheLayers = async function() {
    const scanResults = {
        memory: { keys: [], count: 0, size: 0 },
        localStorage: { keys: [], count: 0, size: 0 },
        sessionStorage: { keys: [], count: 0, size: 0 },
        indexedDB: { databases: [], count: 0, size: 0 },
        browserCache: { caches: [], count: 0, size: 0 },
        specificKeys: { keys: [], count: 0, size: 0 }
    };
    
    try {
        // Scan memory cache
        if (this.memoryCache) {
            scanResults.memory.keys = Object.keys(this.memoryCache);
            scanResults.memory.count = scanResults.memory.keys.length;
            scanResults.memory.size = JSON.stringify(this.memoryCache).length;
        }
        
        // Scan localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                scanResults.localStorage.keys.push(key);
                scanResults.localStorage.size += localStorage.getItem(key).length;
            }
        }
        scanResults.localStorage.count = scanResults.localStorage.keys.length;
        
        // Scan sessionStorage
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key) {
                scanResults.sessionStorage.keys.push(key);
                scanResults.sessionStorage.size += sessionStorage.getItem(key).length;
            }
        }
        scanResults.sessionStorage.count = scanResults.sessionStorage.keys.length;
        
        // Scan IndexedDB - separate cache and historical data
        if ('indexedDB' in window) {
            const cacheDatabases = ['unified-cache', 'tiktrack-cache']; // Cache only
            const historicalDatabases = ['tiktrack-data', 'notifications-history', 'file-mappings', 'linter-results', 'js-analysis']; // Historical data
            
            // Scan cache databases
            for (const dbName of cacheDatabases) {
                try {
                    const dbInfo = await new Promise((resolve) => {
                        const req = indexedDB.open(dbName);
                        req.onsuccess = () => {
                            const db = req.result;
                            let hasData = false;
                            let totalSize = 0;
                            
                            // Check if database has any data
                            if (db.objectStoreNames.length > 0) {
                                const transaction = db.transaction(db.objectStoreNames, 'readonly');
                                let completedStores = 0;
                                
                                for (let i = 0; i < db.objectStoreNames.length; i++) {
                                    const storeName = db.objectStoreNames[i];
                                    const store = transaction.objectStore(storeName);
                                    const countReq = store.count();
                                    
                                    countReq.onsuccess = () => {
                                        if (countReq.result > 0) {
                                            hasData = true;
                                            totalSize += countReq.result;
                                        }
                                        completedStores++;
                                        
                                        if (completedStores === db.objectStoreNames.length) {
                                            db.close();
                                            resolve({ exists: true, hasData, totalSize, type: 'cache' });
                                        }
                                    };
                                    
                                    countReq.onerror = () => {
                                        completedStores++;
                                        if (completedStores === db.objectStoreNames.length) {
                                            db.close();
                                            resolve({ exists: true, hasData: false, totalSize: 0, type: 'cache' });
                                        }
                                    };
                                }
                            } else {
                                db.close();
                                resolve({ exists: true, hasData: false, totalSize: 0, type: 'cache' });
                            }
                        };
                        req.onerror = () => resolve({ exists: false, hasData: false, totalSize: 0, type: 'cache' });
                    });
                    
                    if (dbInfo.exists && dbInfo.hasData) {
                        scanResults.indexedDB.databases.push(`[CACHE] ${dbName} (${dbInfo.totalSize} entries)`);
                        scanResults.indexedDB.count++;
                        scanResults.indexedDB.size += dbInfo.totalSize;
                    }
                } catch (error) {
                    console.warn(`⚠️ Error checking IndexedDB cache ${dbName}:`, error);
                }
            }
            
            // Scan historical databases (for reporting only - not cleared)
            for (const dbName of historicalDatabases) {
                try {
                    const dbInfo = await new Promise((resolve) => {
                        const req = indexedDB.open(dbName);
                        req.onsuccess = () => {
                            const db = req.result;
                            let hasData = false;
                            let totalSize = 0;
                            
                            // Check if database has any data
                            if (db.objectStoreNames.length > 0) {
                                const transaction = db.transaction(db.objectStoreNames, 'readonly');
                                let completedStores = 0;
                                
                                for (let i = 0; i < db.objectStoreNames.length; i++) {
                                    const storeName = db.objectStoreNames[i];
                                    const store = transaction.objectStore(storeName);
                                    const countReq = store.count();
                                    
                                    countReq.onsuccess = () => {
                                        if (countReq.result > 0) {
                                            hasData = true;
                                            totalSize += countReq.result;
                                        }
                                        completedStores++;
                                        
                                        if (completedStores === db.objectStoreNames.length) {
                                            db.close();
                                            resolve({ exists: true, hasData, totalSize, type: 'historical' });
                                        }
                                    };
                                    
                                    countReq.onerror = () => {
                                        completedStores++;
                                        if (completedStores === db.objectStoreNames.length) {
                                            db.close();
                                            resolve({ exists: true, hasData: false, totalSize: 0, type: 'historical' });
                                        }
                                    };
                                }
                            } else {
                                db.close();
                                resolve({ exists: true, hasData: false, totalSize: 0, type: 'historical' });
                            }
                        };
                        req.onerror = () => resolve({ exists: false, hasData: false, totalSize: 0, type: 'historical' });
                    });
                    
                    if (dbInfo.exists && dbInfo.hasData) {
                        scanResults.indexedDB.databases.push(`[HISTORICAL] ${dbName} (${dbInfo.totalSize} entries) - PRESERVED`);
                        scanResults.indexedDB.count++;
                        scanResults.indexedDB.size += dbInfo.totalSize;
                    }
                } catch (error) {
                    console.warn(`⚠️ Error checking IndexedDB historical ${dbName}:`, error);
                }
            }
        }
        
        // Scan Browser Cache
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                scanResults.browserCache.caches = cacheNames;
                scanResults.browserCache.count = cacheNames.length;
            } catch (error) {
                console.warn('⚠️ Error scanning browser cache:', error);
            }
        }
        
        // Scan specific cache keys
        const cacheKeys = [
            'user-preferences', 'ui-state', 'filter-state', 'notifications-history',
            'file-mappings', 'linter-results', 'js-analysis', 'market-data',
            'trade-data', 'dashboard-data'
        ];
        
        for (const key of cacheKeys) {
            if (localStorage.getItem(key) || sessionStorage.getItem(key)) {
                scanResults.specificKeys.keys.push(key);
                scanResults.specificKeys.count++;
            }
        }
        
    } catch (error) {
        console.error('❌ Error during cache scan:', error);
    }
    
    return scanResults;
};

/**
 * Count total keys across all layers
 * @param {Object} scanResults - Results from scanAllCacheLayers
 * @returns {number} Total key count
 */
UnifiedCacheManager.prototype.countTotalKeys = function(scanResults) {
    return scanResults.memory.count +
           scanResults.localStorage.count +
           scanResults.sessionStorage.count +
           scanResults.indexedDB.count +
           scanResults.browserCache.count +
           scanResults.specificKeys.count;
};

/**
 * Verify cache system functionality by testing read/write operations
 * @returns {Promise<Object>} Verification results
 */
UnifiedCacheManager.prototype.verifyCacheFunctionality = async function() {
    const testResults = {
        success: true,
        tests: [],
        errors: []
    };
    
    try {
        // Test 1: Memory cache
        const testKey1 = 'cache-verification-test-memory';
        const testValue1 = { timestamp: Date.now(), test: 'memory-cache' };
        
        try {
            await this.save(testKey1, testValue1, { layer: 'memory' });
            const retrieved1 = await this.get(testKey1);
            if (retrieved1 && retrieved1.test === 'memory-cache') {
                testResults.tests.push({ name: 'Memory Cache', status: 'PASS' });
            } else {
                testResults.tests.push({ name: 'Memory Cache', status: 'FAIL', error: 'Retrieved value mismatch' });
                testResults.success = false;
            }
            await this.remove(testKey1);
        } catch (error) {
            testResults.tests.push({ name: 'Memory Cache', status: 'FAIL', error: error.message });
            testResults.success = false;
        }
        
        // Test 2: localStorage
        const testKey2 = 'cache-verification-test-localStorage';
        const testValue2 = { timestamp: Date.now(), test: 'localStorage' };
        
        try {
            await this.save(testKey2, testValue2, { layer: 'localStorage' });
            const retrieved2 = await this.get(testKey2);
            if (retrieved2 && retrieved2.test === 'localStorage') {
                testResults.tests.push({ name: 'localStorage', status: 'PASS' });
            } else {
                testResults.tests.push({ name: 'localStorage', status: 'FAIL', error: 'Retrieved value mismatch' });
                testResults.success = false;
            }
            await this.remove(testKey2);
        } catch (error) {
            testResults.tests.push({ name: 'localStorage', status: 'FAIL', error: error.message });
            testResults.success = false;
        }
        
        // Test 3: IndexedDB (if available)
        if (this.layers.indexedDB && this.layers.indexedDB.initialized) {
            const testKey3 = 'cache-verification-test-indexedDB';
            const testValue3 = { timestamp: Date.now(), test: 'indexedDB' };
            
            try {
                await this.save(testKey3, testValue3, { layer: 'indexedDB' });
                const retrieved3 = await this.get(testKey3);
                if (retrieved3 && retrieved3.test === 'indexedDB') {
                    testResults.tests.push({ name: 'IndexedDB', status: 'PASS' });
                } else {
                    testResults.tests.push({ name: 'IndexedDB', status: 'FAIL', error: 'Retrieved value mismatch' });
                    testResults.success = false;
                }
                await this.remove(testKey3);
            } catch (error) {
                testResults.tests.push({ name: 'IndexedDB', status: 'FAIL', error: error.message });
                testResults.success = false;
            }
        } else {
            testResults.tests.push({ name: 'IndexedDB', status: 'SKIP', error: 'IndexedDB not available or not initialized' });
        }
        
        // Test 4: Backend cache (if available)
        if (this.layers.backend && this.layers.backend.initialized) {
            const testKey4 = 'cache-verification-test-backend';
            const testValue4 = { timestamp: Date.now(), test: 'backend' };
            
            try {
                await this.save(testKey4, testValue4, { layer: 'backend' });
                const retrieved4 = await this.get(testKey4);
                if (retrieved4 && retrieved4.test === 'backend') {
                    testResults.tests.push({ name: 'Backend Cache', status: 'PASS' });
                } else {
                    testResults.tests.push({ name: 'Backend Cache', status: 'FAIL', error: 'Retrieved value mismatch' });
                    testResults.success = false;
                }
                await this.remove(testKey4);
            } catch (error) {
                testResults.tests.push({ name: 'Backend Cache', status: 'FAIL', error: error.message });
                testResults.success = false;
            }
        }
        
        // Test 5: Layer selection logic
        try {
            const testKey5 = 'cache-verification-test-auto-layer';
            const testValue5 = { timestamp: Date.now(), test: 'auto-layer', data: 'x'.repeat(1000) }; // >1KB to test layer selection
            
            await this.save(testKey5, testValue5); // Let system choose layer
            const retrieved5 = await this.get(testKey5);
            if (retrieved5 && retrieved5.test === 'auto-layer') {
                testResults.tests.push({ name: 'Auto Layer Selection', status: 'PASS' });
            } else {
                testResults.tests.push({ name: 'Auto Layer Selection', status: 'FAIL', error: 'Auto layer selection failed' });
                testResults.success = false;
            }
            await this.remove(testKey5);
        } catch (error) {
            testResults.tests.push({ name: 'Auto Layer Selection', status: 'FAIL', error: error.message });
            testResults.success = false;
        }
        
    } catch (error) {
        testResults.success = false;
        testResults.errors.push(error.message);
        console.error('❌ Cache functionality verification failed:', error);
    }
    
    return testResults;
};

/**
 * Refresh data from backend database for all systems
 * @returns {Promise<Object>} Refresh results
 */
UnifiedCacheManager.prototype.refreshDataFromBackend = async function() {
    const refreshResults = {
        success: true,
        refreshedSystems: [],
        errors: []
    };
    
    try {
        console.log('🔄 Starting data refresh from backend database...');
        
        // 1. Refresh trading data
        try {
            await this.refreshTradingData();
            refreshResults.refreshedSystems.push('Trading Data');
            console.log('✅ Trading data refreshed');
        } catch (error) {
            console.warn('⚠️ Failed to refresh trading data:', error);
            refreshResults.errors.push(`Trading Data: ${error.message}`);
        }
        
        // 2. Refresh market data
        try {
            await this.refreshMarketData();
            refreshResults.refreshedSystems.push('Market Data');
            console.log('✅ Market data refreshed');
        } catch (error) {
            console.warn('⚠️ Failed to refresh market data:', error);
            refreshResults.errors.push(`Market Data: ${error.message}`);
        }
        
        // 3. Refresh user preferences
        try {
            await this.refreshUserPreferences();
            refreshResults.refreshedSystems.push('User Preferences');
            console.log('✅ User preferences refreshed');
        } catch (error) {
            console.warn('⚠️ Failed to refresh user preferences:', error);
            refreshResults.errors.push(`User Preferences: ${error.message}`);
        }
        
        // 4. Refresh UI state
        try {
            await this.refreshUIState();
            refreshResults.refreshedSystems.push('UI State');
            console.log('✅ UI state refreshed');
        } catch (error) {
            console.warn('⚠️ Failed to refresh UI state:', error);
            refreshResults.errors.push(`UI State: ${error.message}`);
        }
        
        // 5. Refresh notifications
        try {
            await this.refreshNotifications();
            refreshResults.refreshedSystems.push('Notifications');
            console.log('✅ Notifications refreshed');
        } catch (error) {
            console.warn('⚠️ Failed to refresh notifications:', error);
            refreshResults.errors.push(`Notifications: ${error.message}`);
        }
        
        if (refreshResults.errors.length > 0) {
            refreshResults.success = false;
        }
        
        console.log('✅ Data refresh from backend completed');
        return refreshResults;
        
    } catch (error) {
        console.error('❌ Data refresh from backend failed:', error);
        return {
            success: false,
            refreshedSystems: [],
            errors: [error.message]
        };
    }
};

/**
 * Refresh trading data from backend
 */
UnifiedCacheManager.prototype.refreshTradingData = async function() {
    try {
        // Clear trading-related cache keys
        const tradingKeys = ['trade-data', 'trades', 'executions', 'trade_plans'];
        tradingKeys.forEach(key => {
            this.remove(key);
        });
        
        // Trigger data reload by dispatching custom events
        if (typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(new CustomEvent('tiktrack:refresh-trading-data', {
                detail: { source: 'cache-clear' }
            }));
        }
        
        // If specific systems are available, refresh them
        if (typeof window.refreshTradingData === 'function') {
            await window.refreshTradingData();
        }
        
    } catch (error) {
        console.warn('⚠️ Error refreshing trading data:', error);
        throw error;
    }
};

/**
 * Refresh market data from backend
 */
UnifiedCacheManager.prototype.refreshMarketData = async function() {
    try {
        // Clear market-related cache keys
        const marketKeys = ['market-data', 'tickers', 'quotes'];
        marketKeys.forEach(key => {
            this.remove(key);
        });
        
        // Trigger data reload
        if (typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(new CustomEvent('tiktrack:refresh-market-data', {
                detail: { source: 'cache-clear' }
            }));
        }
        
        // If specific systems are available, refresh them
        if (typeof window.refreshMarketData === 'function') {
            await window.refreshMarketData();
        }
        
    } catch (error) {
        console.warn('⚠️ Error refreshing market data:', error);
        throw error;
    }
};

/**
 * Refresh user preferences from backend
 */
UnifiedCacheManager.prototype.refreshUserPreferences = async function() {
    try {
        // Clear preferences cache
        this.remove('user-preferences');
        
        // Trigger preferences reload
        if (typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(new CustomEvent('tiktrack:refresh-preferences', {
                detail: { source: 'cache-clear' }
            }));
        }
        
        // If preferences system is available, refresh it
        if (typeof window.refreshUserPreferences === 'function') {
            await window.refreshUserPreferences();
        }
        
    } catch (error) {
        console.warn('⚠️ Error refreshing user preferences:', error);
        throw error;
    }
};

/**
 * Refresh UI state from backend
 */
UnifiedCacheManager.prototype.refreshUIState = async function() {
    try {
        // Clear UI state cache
        this.remove('ui-state');
        this.remove('filter-state');
        
        // Trigger UI state reload
        if (typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(new CustomEvent('tiktrack:refresh-ui-state', {
                detail: { source: 'cache-clear' }
            }));
        }
        
        // If UI state system is available, refresh it
        if (typeof window.refreshUIState === 'function') {
            await window.refreshUIState();
        }
        
    } catch (error) {
        console.warn('⚠️ Error refreshing UI state:', error);
        throw error;
    }
};

/**
 * Refresh notifications from backend
 */
UnifiedCacheManager.prototype.refreshNotifications = async function() {
    try {
        // Clear notifications cache
        this.remove('notifications-history');
        
        // Trigger notifications reload
        if (typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(new CustomEvent('tiktrack:refresh-notifications', {
                detail: { source: 'cache-clear' }
            }));
        }
        
        // If notifications system is available, refresh it
        if (typeof window.refreshNotifications === 'function') {
            await window.refreshNotifications();
        }
        
    } catch (error) {
        console.warn('⚠️ Error refreshing notifications:', error);
        throw error;
    }
};

// ===== GLOBAL FUNCTION EXPORTS =====

// Export functions to global scope for backward compatibility
window.clearAllUnifiedCache = async function(options = {}) {
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
        return await window.UnifiedCacheManager.clearAllCacheDetailed(options);
    } else {
        console.warn('⚠️ UnifiedCacheManager not initialized');
        return { success: false, error: 'UnifiedCacheManager not initialized' };
    }
};

window.clearAllUnifiedCacheQuick = async function(options = {}) {
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
        return await window.UnifiedCacheManager.clearAllCacheQuick(options);
    } else {
        console.warn('⚠️ UnifiedCacheManager not initialized');
        return { success: false, error: 'UnifiedCacheManager not initialized' };
    }
};

window.verifyCacheSystem = async function(options = {}) {
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
        return await window.UnifiedCacheManager.verifyCacheSystem(options);
    } else {
        console.warn('⚠️ UnifiedCacheManager not initialized');
        return { success: false, error: 'UnifiedCacheManager not initialized' };
    }
};

console.log('📦 Unified Cache Manager loaded');
