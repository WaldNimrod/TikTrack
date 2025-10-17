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
            console.log('🔄 Initializing Unified Cache Manager...');
            
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
            console.log('✅ Unified Cache Manager initialized successfully');
            
            // הודעת הצלחה
            if (window.notificationSystem) {
                window.notificationSystem.showNotification(
                    'מערכת מטמון מאוחדת אותחלה בהצלחה',
                    'success'
                );
            }
            
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
            
            console.log(`✅ Saved ${key} to ${layer} layer (${responseTime.toFixed(2)}ms)`);
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
                        
                        console.log(`✅ Retrieved ${key} from ${layer} layer (${responseTime.toFixed(2)}ms)`);
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
        console.log('✅ Memory Layer initialized');
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
        console.log('✅ LocalStorage Layer initialized');
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
                    console.log('✅ IndexedDB Layer initialized');
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
        console.log('✅ Backend Cache Layer initialized');
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

console.log('📦 Unified Cache Manager loaded');
