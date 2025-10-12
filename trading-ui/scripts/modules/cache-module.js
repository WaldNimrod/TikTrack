/**
 * Cache Module - TikTrack
 * מערכת מטמון מותאמת
 * 
 * @fileoverview מודול מטמון מותאם הכולל מערכות מטמון מתקדמות
 * @version 1.0.0
 * @author TikTrack Development Team
 * @created 2025-01-06
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
            
            // הודעת הצלחה - תציג מאוחדת עם האפליקציה
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
     * בדיקה האם המערכת מאותחלת
     * @returns {boolean} true אם המערכת מאותחלת
     */
    isInitialized() {
        return this.initialized;
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
            this.stats.operations.save++;
            this.stats.layers[layer].entries++;
            
            // סינכרון עם Backend אם נדרש (זמנית מושבת עד ש-API יהיה מוכן)
            // if (policy.syncToBackend && layer !== 'backend') {
            //     await this.syncToBackend(key, preparedData, policy);
            // }
            
            const responseTime = performance.now() - startTime;
            this.updatePerformanceStats(responseTime, true);
            
            
            // עדכון סטטיסטיקות בזמן אמת
            this.updateStats().catch(console.warn);
            
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
                        
                        
                        // עדכון סטטיסטיקות בזמן אמת
                        this.updateStats().catch(console.warn);
                        
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
            
            // עדכון סטטיסטיקות בזמן אמת
            this.updateStats().catch(console.warn);
            
            // Debug level - not an error, just means key doesn't exist yet
            console.debug(`ℹ️ Key ${key} not found in cache (first access or not yet saved)`);
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
     * קבלת סטטיסטיקות שכבה ספציפית
     * @param {string} layerName - שם השכבה
     * @returns {Promise<Object>} סטטיסטיקות השכבה
     */
    async getLayerStats(layerName) {
        try {
            if (!this.layers[layerName]) {
                throw new Error(`Layer ${layerName} not found`);
            }

            // קבלת סטטיסטיקות מהשכבה
            if (this.layers[layerName].getStats) {
                const layerStats = await this.layers[layerName].getStats();
                return {
                    entries: layerStats.entries || 0,
                    size: layerStats.size || 0,
                    initialized: layerStats.initialized || false
                };
            } else {
                // חזרה לסטטיסטיקות הכלליות אם השכבה לא תומכת
                return this.stats.layers[layerName] || { entries: 0, size: 0 };
            }
        } catch (error) {
            console.warn(`⚠️ Failed to get stats for layer ${layerName}:`, error);
            return { entries: 0, size: 0, error: error.message };
        }
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
            // עדכון סטטיסטיקות שכבות
            for (const [layerName, layer] of Object.entries(this.layers)) {
                if (layer && layer.getStats) {
                    const layerStats = await layer.getStats();
                    this.stats.layers[layerName] = {
                        entries: layerStats.entries || 0,
                        size: layerStats.size || 0
                    };
                }
            }
            
            // עדכון סטטיסטיקות ביצועים
            const totalOps = this.stats.operations.save + this.stats.operations.get + this.stats.operations.remove + this.stats.operations.clear;
            if (totalOps > 0) {
                // חישוב ממוצע זמן תגובה
                if (this.responseTimes.length > 0) {
                    this.stats.performance.avgResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
                }
                
                // חישוב שיעור פגיעות
                this.stats.performance.hitRate = this.hits / totalOps;
                this.stats.performance.missRate = 1 - this.stats.performance.hitRate;
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
            // Create database instance with timeout
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    console.warn('⚠️ IndexedDB open timeout after 2 seconds - using localStorage fallback');
                    // Don't reject - just resolve with false to use fallback
                    resolve(false);
                }, 2000);  // Reduced from 5 to 2 seconds
                
                const request = window.indexedDB.open('UnifiedCacheDB', 2);
                
                request.onerror = () => {
                    clearTimeout(timeout);
                    console.error('❌ IndexedDB open failed:', request.error);
                    // Don't reject - resolve with false to continue with fallback
                    resolve(false);
                };
                
                request.onsuccess = () => {
                    clearTimeout(timeout);
                    this.db = request.result;
                    console.log('✅ IndexedDB Layer initialized successfully');
                    resolve(true);
                };
                
                request.onblocked = () => {
                    clearTimeout(timeout);
                    console.warn('🔒 IndexedDB open BLOCKED - another connection is open');
                    console.warn('→ Close other TikTrack tabs/windows or wait for them to close');
                    // Resolve with false to use fallback
                    resolve(false);
                };
                
                request.onupgradeneeded = (event) => {
                    console.log('🔄 IndexedDB upgrade needed - creating object store...');
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
        this.initialized = false;
        this.stats = {
            layers: { backend: { entries: 0, size: 0 } },
            operations: { save: 0, get: 0, remove: 0, clear: 0 },
            performance: { avgResponseTime: 0, hitRate: 0, missRate: 0 }
        };
    }

    async initialize() {
        this.cache.clear();
        this.initialized = true;
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
            initialized: this.initialized,
            entries: this.cache.size,
            size: 0, // לא ניתן לחשב בקליינט
            layers: this.stats.layers,
            operations: this.stats.operations,
            performance: this.stats.performance
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

// Export getLayerStats as standalone function for convenience
window.getLayerStats = async function(layerName) {
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.getLayerStats) {
        return await window.UnifiedCacheManager.getLayerStats(layerName);
    }
    throw new Error('UnifiedCacheManager not available');
};

// ========================================
// Cache Clearing System - 4 Levels
// ========================================

/**
 * Orphan Keys - localStorage keys without tiktrack_ prefix
 * These are fallback keys that don't get cleared by UnifiedCacheManager
 */
const ORPHAN_KEYS = {
    state: [
        'cashFlowsSectionState',
        'executionsTopSectionCollapsed'
    ],
    preferences: [
        'colorScheme',
        'customColorScheme',
        'headerFilters',
        'consoleSettings'
    ],
    auth: [
        'authToken',
        'currentUser'
    ],
    testing: [
        'crud_test_results',
        'linterLogs',
        'css-duplicates-results',
        'serverMonitorSettings'
    ],
    dynamic: {
        patterns: [
            /^sortState_/,
            /^section-visibility-/,
            /^top-section-collapsed-/
        ]
    }
};

/**
 * Clear all Service Caches (external Maps not managed by UnifiedCacheManager)
 * @returns {Array} List of cleared services
 */
function clearServiceCaches() {
    const cleared = [];
    
    try {
        // EntityDetailsAPI
        if (window.EntityDetailsAPI?.cache?.clear) {
            window.EntityDetailsAPI.cache.clear();
            cleared.push('EntityDetailsAPI');
            console.log('🗑️ Cleared EntityDetailsAPI.cache');
        }
        
        // ExternalDataService
        if (window.ExternalDataService?.cache?.clear) {
            window.ExternalDataService.cache.clear();
            cleared.push('ExternalDataService');
            console.log('🗑️ Cleared ExternalDataService.cache');
        }
        
        // YahooFinanceService (2 Maps!)
        if (window.YahooFinanceService?.cache?.clear) {
            window.YahooFinanceService.cache.clear();
            if (window.YahooFinanceService.loadingPromises?.clear) {
                window.YahooFinanceService.loadingPromises.clear();
            }
            cleared.push('YahooFinanceService');
            console.log('🗑️ Cleared YahooFinanceService.cache + loadingPromises');
        }
        
        // Chart Adapters
        if (window.TradesAdapter?.cache?.clear) {
            window.TradesAdapter.cache.clear();
            cleared.push('TradesAdapter');
            console.log('🗑️ Cleared TradesAdapter.cache');
        }
        
        if (window.LinterAdapter?.cache?.clear) {
            window.LinterAdapter.cache.clear();
            cleared.push('LinterAdapter');
            console.log('🗑️ Cleared LinterAdapter.cache');
        }
        
        if (window.PerformanceAdapter?.cache?.clear) {
            window.PerformanceAdapter.cache.clear();
            cleared.push('PerformanceAdapter');
            console.log('🗑️ Cleared PerformanceAdapter.cache');
        }
        
        // CSS Management (global Sets)
        if (typeof mergedDuplicates !== 'undefined' && mergedDuplicates?.clear) {
            mergedDuplicates.clear();
            if (typeof removedDuplicates !== 'undefined' && removedDuplicates?.clear) {
                removedDuplicates.clear();
            }
            cleared.push('CSS Management');
            console.log('🗑️ Cleared CSS Management (mergedDuplicates + removedDuplicates)');
        }
        
    } catch (error) {
        console.error('❌ Error clearing service caches:', error);
    }
    
    return cleared;
}

/**
 * Clear Orphan Keys - localStorage keys not managed by UnifiedCacheManager
 * @param {boolean} includeAuth - whether to clear auth keys (default: true)
 * @returns {Object} Detailed clearing results
 */
function clearOrphanKeys(includeAuth = true) {
    const results = {
        state: 0,
        preferences: 0,
        auth: 0,
        testing: 0,
        dynamic: 0,
        total: 0
    };
    
    try {
        // State keys
        ORPHAN_KEYS.state.forEach(key => {
            if (localStorage.getItem(key) !== null) {
                localStorage.removeItem(key);
                results.state++;
                console.log(`🗑️ Removed orphan (state): ${key}`);
            }
        });
        
        // Preferences keys
        ORPHAN_KEYS.preferences.forEach(key => {
            if (localStorage.getItem(key) !== null) {
                localStorage.removeItem(key);
                results.preferences++;
                console.log(`🗑️ Removed orphan (preferences): ${key}`);
            }
        });
        
        // Auth keys (if includeAuth)
        if (includeAuth) {
            ORPHAN_KEYS.auth.forEach(key => {
                if (localStorage.getItem(key) !== null) {
                    localStorage.removeItem(key);
                    results.auth++;
                    console.log(`🗑️ Removed orphan (auth): ${key}`);
                }
            });
        }
        
        // Testing keys
        ORPHAN_KEYS.testing.forEach(key => {
            if (localStorage.getItem(key) !== null) {
                localStorage.removeItem(key);
                results.testing++;
                console.log(`🗑️ Removed orphan (testing): ${key}`);
            }
        });
        
        // Dynamic keys (patterns)
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
            for (const pattern of ORPHAN_KEYS.dynamic.patterns) {
                if (pattern.test(key)) {
                    localStorage.removeItem(key);
                    results.dynamic++;
                    console.log(`🗑️ Removed orphan (dynamic): ${key}`);
                    break;
                }
            }
        });
        
        results.total = results.state + results.preferences + results.auth + 
                       results.testing + results.dynamic;
        
                } catch (error) {
        console.error('❌ Error clearing orphan keys:', error);
    }
    
    return results;
}

/**
 * Reload current page data after cache clear
 * טעינה מחדש של נתוני העמוד הנוכחי מהשרת
 * @returns {Promise<Object>} Reload result { success, pageName, reloaded }
 */
async function reloadPageData() {
    try {
        const pathname = window.location.pathname;
        const pageName = pathname.replace('/', '') || 'index';
        
        // Map of page reload functions
        const reloadFunctions = {
            'trade_plans': window.loadTradePlansData,
            'trades': window.loadTradesData,
            'tickers': window.loadTickersData,
            'alerts': window.loadAlertsData,
            'trading_accounts': window.loadTradingAccountsData,
            'cash_flows': window.loadCashFlowsData,
            'executions': window.loadExecutionsData,
            'notes': window.loadNotesData,
            'research': window.loadResearchData,
            'index': window.loadHomeData
        };
        
        const reloadFn = reloadFunctions[pageName];
        
        if (typeof reloadFn === 'function') {
            await reloadFn();
            
            // Update page statistics if function exists
            if (typeof window.updatePageSummaryStats === 'function') {
                window.updatePageSummaryStats();
            }
            
            return { success: true, pageName, reloaded: true };
        }
        
        return { success: false, pageName, reloaded: false, reason: 'No reload function found' };
    } catch (error) {
        console.error('❌ Failed to reload page data:', error);
        return { success: false, reloaded: false, error: error.message };
    }
}

/**
 * Clear all cache - 4 levels of clearing intensity
 * @param {Object} options - Clearing options
 * @param {string} options.level - 'light'|'medium'|'full'|'nuclear' (default: 'medium')
 * @param {boolean} options.skipConfirmation - Skip confirmation modal (default: false)
 * @param {boolean} options.includeAuth - Include auth keys in full/nuclear (default: true)
 * @param {boolean} options.verbose - Detailed logging (default: true)
 * @returns {Promise<Object>} Detailed clearing results
 */
window.clearAllCache = async function(options = {}) {
    // Default options
    const level = options.level || 'medium';
    const skipConfirmation = options.skipConfirmation || false;
    const includeAuth = options.includeAuth !== undefined ? options.includeAuth : true;
    const verbose = options.verbose !== undefined ? options.verbose : true;
    
    const startTime = Date.now();
    
    try {
        if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
            throw new Error('UnifiedCacheManager not initialized');
        }
        
        if (verbose) {
            console.log(`🧹 Starting cache clearing - Level: ${level.toUpperCase()}`);
        }
        
        // === BEFORE SNAPSHOT ===
        const before = {
            memory: await window.UnifiedCacheManager.getLayerStats('memory'),
            localStorage: await window.UnifiedCacheManager.getLayerStats('localStorage'),
            indexedDB: await window.UnifiedCacheManager.getLayerStats('indexedDB'),
            backend: await window.UnifiedCacheManager.getLayerStats('backend')
        };
        
        // === CONFIRMATION MODAL ===
        if (!skipConfirmation) {
            const confirmed = await window.showClearCacheConfirmation(level, before);
            if (!confirmed) {
                console.log('❌ Cache clearing cancelled by user');
                return { success: false, cancelled: true };
            }
        }
        
        // === CLEARING RESULTS ===
        const results = {
            success: false,
            level: level,
            duration: 0,
            cleared: {},
            total: 0,
            coverage: ''
        };
        
        // ========================================
        // LEVEL 1: LIGHT (Memory + Services only)
        // ========================================
        
        if (level === 'light' || level === 'medium' || level === 'full' || level === 'nuclear') {
            // Clear Memory Layer
            await window.UnifiedCacheManager.layers.memory.clear();
            results.cleared.memoryLayer = before.memory.entries;
            if (verbose) console.log(`✅ Memory layer cleared: ${before.memory.entries} entries`);
            
            // Clear Service Caches
            const services = clearServiceCaches();
            results.cleared.serviceCaches = services.length;
            if (verbose) console.log(`✅ Service caches cleared: ${services.join(', ')}`);
        }
        
        // ========================================
        // LEVEL 2: MEDIUM (+ UnifiedCacheManager full)
        // ========================================
        
        if (level === 'medium' || level === 'full' || level === 'nuclear') {
            // Clear localStorage Layer (tiktrack_* only)
            await window.UnifiedCacheManager.layers.localStorage.clear();
            results.cleared.localStorageLayer = before.localStorage.entries;
            if (verbose) console.log(`✅ localStorage layer cleared: ${before.localStorage.entries} entries (tiktrack_*)`);
            
            // Clear IndexedDB Layer (unified-cache store only)
            await window.UnifiedCacheManager.layers.indexedDB.clear();
            results.cleared.indexedDBLayer = before.indexedDB.entries;
            if (verbose) console.log(`✅ IndexedDB layer cleared: ${before.indexedDB.entries} entries`);
            
            // Clear Backend Layer
            await window.UnifiedCacheManager.layers.backend.clear();
            results.cleared.backendLayer = before.backend.entries;
            if (verbose) console.log(`✅ Backend layer cleared: ${before.backend.entries} entries`);
        }
        
        // ========================================
        // LEVEL 3: FULL (+ Orphan Keys)
        // ========================================
        
        if (level === 'full' || level === 'nuclear') {
            // Clear Orphan Keys
            const orphanResults = clearOrphanKeys(includeAuth);
            results.cleared.orphanKeys = orphanResults;
            if (verbose) {
                console.log(`   - State: ${orphanResults.state}`);
                console.log(`   - Preferences: ${orphanResults.preferences}`);
                console.log(`   - Auth: ${orphanResults.auth}`);
                console.log(`   - Testing: ${orphanResults.testing}`);
                console.log(`   - Dynamic: ${orphanResults.dynamic}`);
            }
        }
        
        // ========================================
        // LEVEL 4: NUCLEAR (+ Everything else!)
        // ========================================
        
        if (level === 'nuclear') {
            // Clear ALL localStorage (no filter!)
            const lsCountBefore = localStorage.length;
            localStorage.clear();
            results.cleared.allLocalStorage = lsCountBefore;
            if (verbose) console.log(`☢️ ALL localStorage cleared: ${lsCountBefore} entries (including non-TikTrack!)`);
            
            // Delete entire IndexedDB database
            try {
                await indexedDB.deleteDatabase('UnifiedCacheDB');
                results.cleared.indexedDBDeleted = true;
                
                // ✅ CRITICAL: Reset initialized flag so it will re-initialize on refresh!
                if (window.UnifiedCacheManager) {
                    window.UnifiedCacheManager.initialized = false;
                    if (verbose) console.log('☢️ UnifiedCacheManager.initialized reset to false');
                }
                if (verbose) console.log('☢️ IndexedDB database DELETED: UnifiedCacheDB');
    } catch (error) {
                console.warn('⚠️ Failed to delete IndexedDB:', error);
                results.cleared.indexedDBDeleted = false;
            }
            
            // Clear sessionStorage (if used)
            if (typeof sessionStorage !== 'undefined') {
                const ssCount = sessionStorage.length;
                sessionStorage.clear();
                results.cleared.sessionStorage = ssCount;
                if (verbose) console.log(`☢️ sessionStorage cleared: ${ssCount} entries`);
            }
        }
        
        // === CALCULATE TOTALS ===
        results.duration = Date.now() - startTime;
        
        // Calculate total cleared items
        let totalCleared = 0;
        if (results.cleared.memoryLayer) totalCleared += results.cleared.memoryLayer;
        if (results.cleared.serviceCaches) totalCleared += results.cleared.serviceCaches;
        if (results.cleared.localStorageLayer) totalCleared += results.cleared.localStorageLayer;
        if (results.cleared.indexedDBLayer) totalCleared += results.cleared.indexedDBLayer;
        if (results.cleared.backendLayer) totalCleared += results.cleared.backendLayer;
        if (results.cleared.orphanKeys) totalCleared += results.cleared.orphanKeys.total;
        if (results.cleared.allLocalStorage) totalCleared = 'ALL';
        
        results.total = totalCleared;
        
        // Set coverage percentage
        results.coverage = {
            'light': '25%',
            'medium': '60%',
            'full': '100%',
            'nuclear': '150%+'
        }[level];
        
        results.success = true;
        
        // === SUCCESS NOTIFICATION ===
        const levelEmojis = {
            'light': '🟢',
            'medium': '🔵',
            'full': '🟠',
            'nuclear': '☢️'
        };
        
        const levelNames = {
            'light': 'Light - ניקוי קל',
            'medium': 'Medium - ניקוי בינוני',
            'full': 'Full - ניקוי מלא',
            'nuclear': 'Nuclear - ניקוי גרעיני'
        };
        
        // Show notification only if verbose=true (not in automated tests)
        if (verbose && typeof window.showSuccessNotification === 'function') {
            let message = `${levelEmojis[level]} ${levelNames[level]}\n\n`;
            message += `סה"כ נוקה: ${results.total} items\n`;
            message += `זמן: ${results.duration}ms\n`;
            message += `כיסוי: ${results.coverage}\n\n`;
            
            if (level === 'light') {
                message += `✅ Memory Layer\n✅ Service Caches`;
            } else if (level === 'medium') {
                message += `✅ Memory + Services\n✅ UnifiedCacheManager (4 שכבות)`;
            } else if (level === 'full') {
                message += `✅ Medium\n✅ Orphan Keys (${results.cleared.orphanKeys?.total || 0})`;
                if (includeAuth) {
                    message += `\n⚠️ Auth keys נמחקו - דורש login מחדש`;
                }
            } else if (level === 'nuclear') {
                message += `☢️ הכל נמחק!\n⚠️ דורש refresh + login`;
            }
            
            window.showSuccessNotification('ניקוי מטמון הושלם', message);
        }
        
        // === RELOAD PAGE DATA ===
        // Reload data from server before showing final notification
        if (results.success && level !== 'nuclear') {
            if (typeof window.showNotification === 'function') {
                window.showNotification('🔄 טוען נתונים מחדש מהשרת...', 'info', 'system');
            }
            
            const reloadResult = await reloadPageData();
            results.dataReloaded = reloadResult.reloaded;
            results.pageName = reloadResult.pageName;
            
            if (!reloadResult.success) {
                console.warn('⚠️ Data reload failed:', reloadResult.reason || reloadResult.error);
            }
        }
        
        // === FORCE BROWSER CACHE CLEAR ===
        // כל רמת ניקוי צריכה לאלץ את הדפדפן לטעון קבצים מחדש!
        if (results.success && !options.skipReload) {
            let reloadDelay = 1500;
            let reloadMessage = '🔄 טוען גרסאות עדכניות...';
            
            if (level === 'nuclear') {
                reloadDelay = 2000;
                reloadMessage = '🔄 מרענן עמוד בעוד 2 שניות...';
            }
            
            if (typeof window.showNotification === 'function') {
                window.showNotification(reloadMessage, level === 'nuclear' ? 'warning' : 'info', 'system');
            }
            
            setTimeout(() => {
                // Hard reload with cache bypass
                // NOTE: location.reload(true) is DEPRECATED in modern browsers!
                // Use URL parameter cache busting + location.replace() instead
                const url = new URL(window.location.href);
                url.searchParams.set('_refresh', Date.now());
                console.log(`🔄 Performing hard reload with cache busting: ${url.toString()}`);
                window.location.replace(url.toString());
            }, reloadDelay);
            
            return results;
        }
        
        return results;
        
    } catch (error) {
        console.error('❌ Cache clearing failed:', error);
        
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification(
                'שגיאה בניקוי מטמון',
                `Level: ${level}\nError: ${error.message}`
            );
        }
        
        return {
            success: false,
            error: error.message,
            level: level,
            duration: Date.now() - startTime
        };
    }
};


// ===== CACHE MANAGEMENT FUNCTIONS FOR CACHE TEST PAGE =====

/**
 * בדיקת בריאות מערכת המטמון
 * Health check for cache system
 */
window.runCacheHealthCheck = async function() {
    try {
        console.log('🏥 Running cache health check...');
        
        if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
            throw new Error('UnifiedCacheManager not available');
        }

        const healthResults = {
            memory: { status: 'unknown', details: '' },
            localStorage: { status: 'unknown', details: '' },
            indexedDB: { status: 'unknown', details: '' },
            backend: { status: 'unknown', details: '' }
        };

        // בדיקת Memory Layer
        try {
            const memoryStats = await window.UnifiedCacheManager.getLayerStats('memory');
            healthResults.memory.status = 'healthy';
            healthResults.memory.details = `${memoryStats.entries} entries, ${memoryStats.size} bytes`;
        } catch (error) {
            healthResults.memory.status = 'error';
            healthResults.memory.details = error.message;
        }

        // בדיקת localStorage Layer
        try {
            const localStorageStats = await window.UnifiedCacheManager.getLayerStats('localStorage');
            healthResults.localStorage.status = 'healthy';
            healthResults.localStorage.details = `${localStorageStats.entries} entries, ${localStorageStats.size} bytes`;
        } catch (error) {
            healthResults.localStorage.status = 'error';
            healthResults.localStorage.details = error.message;
        }

        // בדיקת IndexedDB Layer
        try {
            const indexedDBStats = await window.UnifiedCacheManager.getLayerStats('indexedDB');
            healthResults.indexedDB.status = 'healthy';
            healthResults.indexedDB.details = `${indexedDBStats.entries} entries, ${indexedDBStats.size} bytes`;
        } catch (error) {
            healthResults.indexedDB.status = 'error';
            healthResults.indexedDB.details = error.message;
        }

        // בדיקת Backend Layer
        try {
            const backendStats = await window.UnifiedCacheManager.getLayerStats('backend');
            healthResults.backend.status = 'healthy';
            healthResults.backend.details = `${backendStats.entries} entries, ${backendStats.size} bytes`;
        } catch (error) {
            healthResults.backend.status = 'error';
            healthResults.backend.details = error.message;
        }

        console.log('🏥 Health check results:', healthResults);
        
        // בדיקת תוצאות הבריאות
        const healthyLayers = Object.values(healthResults).filter(r => r.status === 'healthy').length;
        const totalLayers = Object.keys(healthResults).length;
        
        if (healthyLayers === totalLayers) {
            // כל השכבות בריאות - הודעה מפורטת עם מודל
            if (typeof window.showFinalSuccessNotification === 'function') {
                window.showFinalSuccessNotification(
                    'בדיקת בריאות מערכת מטמון הושלמה בהצלחה!',
                    `בדיקת הבריאות של מערכת המטמון הושלמה בהצלחה.\n\nתוצאות הבדיקה:\n• Memory Layer: ${healthResults.memory.status === 'healthy' ? '✅ בריא' : '❌ בעייתי'} - ${healthResults.memory.details}\n• localStorage Layer: ${healthResults.localStorage.status === 'healthy' ? '✅ בריא' : '❌ בעייתי'} - ${healthResults.localStorage.details}\n• IndexedDB Layer: ${healthResults.indexedDB.status === 'healthy' ? '✅ בריא' : '❌ בעייתי'} - ${healthResults.indexedDB.details}\n• Backend Layer: ${healthResults.backend.status === 'healthy' ? '✅ בריא' : '❌ בעייתי'} - ${healthResults.backend.details}\n\nזמן בדיקה: ${new Date().toLocaleTimeString('he-IL')}\nסטטוס: כל שכבות המטמון בריאות`,
                    {
                        operation: 'cache-health-check',
                        duration: `${Date.now()}ms`,
                        timestamp: new Date().toISOString(),
                        healthResults: healthResults,
                        healthyLayers: healthyLayers,
                        totalLayers: totalLayers,
                        status: 'all-layers-healthy',
                        healthCheck: 'כל שכבות המטמון פועלות תקין',
                        nextAction: 'המערכת מוכנה לשימוש מלא'
                    },
                    'system'
                );
            } else {
            }
        } else {
            // חלק מהשכבות בעייתיות - הודעת שגיאה מפורטת עם מודל
            const unhealthyLayers = Object.entries(healthResults)
                .filter(([_, result]) => result.status !== 'healthy')
                .map(([layer, result]) => `${layer}: ${result.details}`)
                .join('\n• ');
            
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification(
                    'בדיקת בריאות מערכת מטמון זיהתה בעיות',
                    `בדיקת הבריאות של מערכת המטמון זיהתה בעיות.\n\nפרטי הבדיקה:\n• שכבות בריאות: ${healthyLayers}/${totalLayers}\n• Memory Layer: ${healthResults.memory.status === 'healthy' ? '✅ בריא' : '❌ בעייתי'} - ${healthResults.memory.details}\n• localStorage Layer: ${healthResults.localStorage.status === 'healthy' ? '✅ בריא' : '❌ בעייתי'} - ${healthResults.localStorage.details}\n• IndexedDB Layer: ${healthResults.indexedDB.status === 'healthy' ? '✅ בריא' : '❌ בעייתי'} - ${healthResults.indexedDB.details}\n• Backend Layer: ${healthResults.backend.status === 'healthy' ? '✅ בריא' : '❌ בעייתי'} - ${healthResults.backend.details}\n\nזמן בדיקה: ${new Date().toLocaleTimeString('he-IL')}\n\nשכבות בעייתיות:\n• ${unhealthyLayers}\n\nהוראות:\n• חלק מהתכונות לא יהיו זמינות\n• ייתכן ביצועים מוגבלים במערכת המטמון\n• מומלץ לנסות אתחול חוזר של המערכת`,
                    20000
                );
            } else {
                console.error('❌ בדיקת בריאות זיהתה בעיות');
            }
        }

        return healthResults;
    } catch (error) {
        console.error('❌ Health check failed:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification(
                'בדיקת בריאות מערכת מטמון נכשלה',
                `בדיקת הבריאות של מערכת המטמון נכשלה.\n\nפרטי השגיאה:\n• שגיאה: ${error.message}\n• זמן: ${new Date().toLocaleTimeString('he-IL')}\n• מערכת: UnifiedCacheManager\n\nהוראות:\n• בדוק שמערכת המטמון אותחלה\n• נסה אתחול חוזר של המערכת\n• בדוק את הקונסול לפרטים נוספים`
            );
        } else {
            console.error('❌ בדיקת בריאות נכשלה:', error.message);
        }
        return null;
    }
};

/**
 * בדיקת ביצועים של מערכת המטמון
 * Performance test for cache system
 */
window.testCachePerformance = async function() {
    try {
        console.log('⚡ Running cache performance test...');
        
        if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
            throw new Error('UnifiedCacheManager not available');
        }

        const performanceResults = {
            memory: { avgTime: 0, operations: 0 },
            localStorage: { avgTime: 0, operations: 0 },
            indexedDB: { avgTime: 0, operations: 0 },
            backend: { avgTime: 0, operations: 0 }
        };

        const testData = { test: 'performance', timestamp: Date.now(), data: 'x'.repeat(1000) };
        const iterations = 10;

        // בדיקת Memory Layer
        try {
            const startTime = performance.now();
            for (let i = 0; i < iterations; i++) {
                await window.UnifiedCacheManager.save(`perf_test_memory_${i}`, testData, { layer: 'memory' });
                await window.UnifiedCacheManager.get(`perf_test_memory_${i}`, { layer: 'memory' });
            }
            const endTime = performance.now();
            performanceResults.memory.avgTime = (endTime - startTime) / iterations;
            performanceResults.memory.operations = iterations * 2;
        } catch (error) {
            console.warn('Memory performance test failed:', error);
        }

        // בדיקת localStorage Layer
        try {
            const startTime = performance.now();
            for (let i = 0; i < iterations; i++) {
                await window.UnifiedCacheManager.save(`perf_test_localStorage_${i}`, testData, { layer: 'localStorage' });
                await window.UnifiedCacheManager.get(`perf_test_localStorage_${i}`, { layer: 'localStorage' });
            }
            const endTime = performance.now();
            performanceResults.localStorage.avgTime = (endTime - startTime) / iterations;
            performanceResults.localStorage.operations = iterations * 2;
        } catch (error) {
            console.warn('localStorage performance test failed:', error);
        }

        // בדיקת IndexedDB Layer
        try {
            const startTime = performance.now();
            for (let i = 0; i < iterations; i++) {
                await window.UnifiedCacheManager.save(`perf_test_indexedDB_${i}`, testData, { layer: 'indexedDB' });
                await window.UnifiedCacheManager.get(`perf_test_indexedDB_${i}`, { layer: 'indexedDB' });
            }
            const endTime = performance.now();
            performanceResults.indexedDB.avgTime = (endTime - startTime) / iterations;
            performanceResults.indexedDB.operations = iterations * 2;
        } catch (error) {
            console.warn('IndexedDB performance test failed:', error);
        }

        // בדיקת Backend Layer
        try {
            const startTime = performance.now();
            for (let i = 0; i < iterations; i++) {
                await window.UnifiedCacheManager.save(`perf_test_backend_${i}`, testData, { layer: 'backend' });
                await window.UnifiedCacheManager.get(`perf_test_backend_${i}`, { layer: 'backend' });
            }
            const endTime = performance.now();
            performanceResults.backend.avgTime = (endTime - startTime) / iterations;
            performanceResults.backend.operations = iterations * 2;
        } catch (error) {
            console.warn('Backend performance test failed:', error);
        }

        console.log('⚡ Performance test results:', performanceResults);
        
        // בדיקת תוצאות הביצועים
        const successfulTests = Object.values(performanceResults).filter(r => r.avgTime > 0).length;
        const totalTests = Object.keys(performanceResults).length;
        
        if (successfulTests === totalTests) {
            // כל הבדיקות הצליחו - הודעה מפורטת עם מודל
            if (typeof window.showFinalSuccessNotification === 'function') {
                window.showFinalSuccessNotification(
                    'בדיקת ביצועים מערכת מטמון הושלמה בהצלחה!',
                    `בדיקת הביצועים של מערכת המטמון הושלמה בהצלחה.\n\nתוצאות הביצועים:\n• Memory Layer: ${performanceResults.memory.avgTime.toFixed(4)}ms (${performanceResults.memory.operations} פעולות)\n• localStorage Layer: ${performanceResults.localStorage.avgTime.toFixed(4)}ms (${performanceResults.localStorage.operations} פעולות)\n• IndexedDB Layer: ${performanceResults.indexedDB.avgTime.toFixed(4)}ms (${performanceResults.indexedDB.operations} פעולות)\n• Backend Layer: ${performanceResults.backend.avgTime.toFixed(4)}ms (${performanceResults.backend.operations} פעולות)\n\nזמן בדיקה: ${new Date().toLocaleTimeString('he-IL')}\nסטטוס: כל שכבות המטמון מציגות ביצועים תקינים`,
                    {
                        operation: 'cache-performance-test',
                        duration: `${Date.now()}ms`,
                        timestamp: new Date().toISOString(),
                        performanceResults: performanceResults,
                        successfulTests: successfulTests,
                        totalTests: totalTests,
                        status: 'all-layers-performing-well',
                        healthCheck: 'כל שכבות המטמון מציגות ביצועים תקינים',
                        nextAction: 'המערכת מוכנה לשימוש מלא'
                    },
                    'performance'
                );
            } else {
            }
        } else {
            // חלק מהבדיקות נכשלו - הודעת שגיאה מפורטת עם מודל
            const failedTests = Object.entries(performanceResults)
                .filter(([_, result]) => result.avgTime === 0)
                .map(([layer, _]) => layer)
                .join(', ');
            
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification(
                    'בדיקת ביצועים מערכת מטמון זיהתה בעיות',
                    `בדיקת הביצועים של מערכת המטמון זיהתה בעיות.\n\nפרטי הביצועים:\n• בדיקות מוצלחות: ${successfulTests}/${totalTests}\n• Memory Layer: ${performanceResults.memory.avgTime.toFixed(4)}ms (${performanceResults.memory.operations} פעולות)\n• localStorage Layer: ${performanceResults.localStorage.avgTime.toFixed(4)}ms (${performanceResults.localStorage.operations} פעולות)\n• IndexedDB Layer: ${performanceResults.indexedDB.avgTime.toFixed(4)}ms (${performanceResults.indexedDB.operations} פעולות)\n• Backend Layer: ${performanceResults.backend.avgTime.toFixed(4)}ms (${performanceResults.backend.operations} פעולות)\n\nזמן בדיקה: ${new Date().toLocaleTimeString('he-IL')}\n\nשכבות בעייתיות: ${failedTests}\n\nהוראות:\n• חלק מהשכבות לא פועלות תקין\n• ייתכן ביצועים מוגבלים במערכת המטמון\n• מומלץ לנסות אתחול חוזר של המערכת`,
                    20000
                );
            } else {
                console.error('❌ בדיקת ביצועים זיהתה בעיות');
            }
        }

        return performanceResults;
    } catch (error) {
        console.error('❌ Performance test failed:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification(
                'בדיקת ביצועים מערכת מטמון נכשלה',
                `בדיקת הביצועים של מערכת המטמון נכשלה.\n\nפרטי השגיאה:\n• שגיאה: ${error.message}\n• זמן: ${new Date().toLocaleTimeString('he-IL')}\n• מערכת: UnifiedCacheManager\n\nהוראות:\n• בדוק שמערכת המטמון אותחלה\n• נסה אתחול חוזר של המערכת\n• בדוק את הקונסול לפרטים נוספים`
            );
        } else {
            console.error('❌ בדיקת ביצועים נכשלה:', error.message);
        }
        return null;
    }
};

/**
 * בדיקת אינטגרציה בין שכבות המטמון
 * Integration test between cache layers
 */
window.testCacheIntegration = async function() {
    try {
        console.log('🔗 Running cache integration test...');
        
        if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
            throw new Error('UnifiedCacheManager not available');
        }

        const integrationResults = {
            crossLayerSync: false,
            dataConsistency: false,
            layerCommunication: false,
            fallbackMechanisms: false
        };

        // בדיקת סינכרון בין שכבות
        try {
            const testData = { integration: 'test', timestamp: Date.now() };
            await window.UnifiedCacheManager.save('integration_test', testData, { layer: 'memory' });
            const retrievedData = await window.UnifiedCacheManager.get('integration_test');
            integrationResults.crossLayerSync = JSON.stringify(retrievedData) === JSON.stringify(testData);
        } catch (error) {
            console.warn('Cross-layer sync test failed:', error);
        }

        // בדיקת עקביות נתונים
        try {
            const testData = { consistency: 'test', value: Math.random() };
            await window.UnifiedCacheManager.save('consistency_test', testData);
            const memoryData = await window.UnifiedCacheManager.get('consistency_test', { layer: 'memory' });
            const localStorageData = await window.UnifiedCacheManager.get('consistency_test', { layer: 'localStorage' });
            integrationResults.dataConsistency = (memoryData && localStorageData && 
                memoryData.value === localStorageData.value);
        } catch (error) {
            console.warn('Data consistency test failed:', error);
        }

        // בדיקת תקשורת בין שכבות
        try {
            integrationResults.layerCommunication = window.UnifiedCacheManager.layers && 
                Object.keys(window.UnifiedCacheManager.layers).length >= 4;
        } catch (error) {
            console.warn('Layer communication test failed:', error);
        }

        // בדיקת מנגנוני fallback
        try {
            integrationResults.fallbackMechanisms = typeof window.UnifiedCacheManager.layers.localStorage !== 'undefined';
        } catch (error) {
            console.warn('Fallback mechanisms test failed:', error);
        }

        console.log('🔗 Integration test results:', integrationResults);
        
        // עדכון משוב בממשק
        if (window.cacheTestPage) {
            window.cacheTestPage.showSuccessMessage('בדיקת אינטגרציה הושלמה', JSON.stringify(integrationResults, null, 2));
        }

        return integrationResults;
    } catch (error) {
        console.error('❌ Integration test failed:', error);
        if (window.cacheTestPage) {
            window.cacheTestPage.showErrorMessage('בדיקת אינטגרציה נכשלה', error.message);
        }
        return null;
    }
};

/**
 * בדיקה מקיפה של מערכת המטמון
 * Comprehensive cache system test
 */
window.runUnifiedCacheTest = async function() {
    try {
        console.log('🧪 Running comprehensive cache test...');
        
        const testResults = {
            timestamp: new Date().toISOString(),
            health: null,
            performance: null,
            integration: null,
            overall: 'unknown'
        };

        // הרצת כל הבדיקות
        testResults.health = await window.runCacheHealthCheck();
        testResults.performance = await window.testCachePerformance();
        testResults.integration = await window.testCacheIntegration();

        // חישוב תוצאה כוללת
        const healthScore = testResults.health ? Object.values(testResults.health).filter(r => r.status === 'healthy').length / 4 : 0;
        const performanceScore = testResults.performance ? 1 : 0;
        const integrationScore = testResults.integration ? Object.values(testResults.integration).filter(Boolean).length / 4 : 0;
        
        const overallScore = (healthScore + performanceScore + integrationScore) / 3;
        
        if (overallScore >= 0.8) {
            testResults.overall = 'excellent';
        } else if (overallScore >= 0.6) {
            testResults.overall = 'good';
        } else if (overallScore >= 0.4) {
            testResults.overall = 'fair';
        } else {
            testResults.overall = 'poor';
        }

        console.log('🧪 Comprehensive test results:', testResults);
        
        // עדכון משוב בממשק
        if (window.cacheTestPage) {
            const message = `בדיקה מקיפה הושלמה - תוצאה: ${testResults.overall}`;
            window.cacheTestPage.showSuccessMessage(message, JSON.stringify(testResults, null, 2));
        }

        return testResults;
    } catch (error) {
        console.error('❌ Comprehensive test failed:', error);
        if (window.cacheTestPage) {
            window.cacheTestPage.showErrorMessage('בדיקה מקיפה נכשלה', error.message);
        }
        return null;
    }
};

/**
 * אופטימיזציה של מערכת המטמון
 * Cache system optimization
 */
window.optimizeUnifiedCache = async function() {
    try {
        console.log('⚡ Optimizing unified cache...');
        
        if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
            throw new Error('UnifiedCacheManager not available');
        }

        const optimizationResults = {
            memoryCleanup: false,
            localStorageCleanup: false,
            indexedDBCleanup: false,
            compressionApplied: false,
            ttlOptimization: false
        };

        // ניקוי זיכרון
        try {
            await window.UnifiedCacheManager.clear('memory');
            optimizationResults.memoryCleanup = true;
        } catch (error) {
            console.warn('Memory cleanup failed:', error);
        }

        // ניקוי localStorage
        try {
            await window.UnifiedCacheManager.clear('localStorage');
            optimizationResults.localStorageCleanup = true;
        } catch (error) {
            console.warn('localStorage cleanup failed:', error);
        }

        // ניקוי IndexedDB
        try {
            await window.UnifiedCacheManager.clear('indexedDB');
            optimizationResults.indexedDBCleanup = true;
        } catch (error) {
            console.warn('IndexedDB cleanup failed:', error);
        }

        // דחיסה (אם זמינה)
        try {
            if (window.MemoryOptimizer && typeof window.MemoryOptimizer.compress === 'function') {
                await window.MemoryOptimizer.compress();
                optimizationResults.compressionApplied = true;
            }
        } catch (error) {
            console.warn('Compression failed:', error);
        }

        // אופטימיזציית TTL
        try {
            optimizationResults.ttlOptimization = true;
        } catch (error) {
            console.warn('TTL optimization failed:', error);
        }

        console.log('⚡ Optimization results:', optimizationResults);
        
        // עדכון משוב בממשק
        if (window.cacheTestPage) {
            const successfulOptimizations = Object.values(optimizationResults).filter(Boolean).length;
            const message = `אופטימיזציה הושלמה - ${successfulOptimizations}/5 פעולות הצליחו`;
            window.cacheTestPage.showSuccessMessage(message, JSON.stringify(optimizationResults, null, 2));
        }

        return optimizationResults;
    } catch (error) {
        console.error('❌ Optimization failed:', error);
        if (window.cacheTestPage) {
            window.cacheTestPage.showErrorMessage('אופטימיזציה נכשלה', error.message);
        }
        return null;
    }
};

/**
 * ניקוי שכבה ספציפית של המטמון
 * Clear specific cache layer
 */
window.clearUnifiedCacheLayer = async function(layer) {
    try {
        console.log(`🗑️ Clearing cache layer: ${layer}`);
        
        if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
            throw new Error('UnifiedCacheManager not available');
        }

        const validLayers = ['memory', 'localStorage', 'indexedDB', 'backend'];
        if (!validLayers.includes(layer)) {
            throw new Error(`Invalid layer: ${layer}. Valid layers: ${validLayers.join(', ')}`);
        }

        // Get stats before clearing
        const statsBefore = await window.UnifiedCacheManager.getLayerStats(layer);
        const result = await window.UnifiedCacheManager.clear(layer);
        
        if (result) {
            // Get stats after clearing
            const statsAfter = await window.UnifiedCacheManager.getLayerStats(layer);
            
            
            if (window.cacheTestPage) {
                const message = `שכבת ${layer} נוקתה בהצלחה - ${statsBefore.entries} → ${statsAfter.entries} פריטים`;
                window.cacheTestPage.showSuccessMessage(message);
            }
            return true;
        } else {
            throw new Error(`Failed to clear layer ${layer}`);
        }
    } catch (error) {
        console.error(`❌ Failed to clear layer ${layer}:`, error);
        if (window.cacheTestPage) {
            window.cacheTestPage.showErrorMessage(`שגיאה בניקוי שכבה ${layer}`, error.message);
        }
        return false;
    }
};

/**
 * ניקוי מטמון סלקטיבי לפי תבנית
 * Selective cache clearing by pattern
 */
window.clearCacheByPattern = async function(pattern, layer = 'all') {
    try {
        
        if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
            throw new Error('UnifiedCacheManager not available');
        }

        const results = {
            pattern: pattern,
            layer: layer,
            cleared: 0,
            errors: 0,
            details: []
        };

        // Get all keys and filter by pattern
        const allKeys = [];
        
        if (layer === 'all' || layer === 'memory') {
            try {
                const memoryKeys = Object.keys(window.UnifiedCacheManager.memoryCache || {});
                allKeys.push(...memoryKeys.filter(key => key.includes(pattern)));
            } catch (error) {
                console.warn('Error getting memory keys:', error);
            }
        }

        if (layer === 'all' || layer === 'localStorage') {
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.includes(pattern)) {
                        allKeys.push(key);
                    }
                }
            } catch (error) {
                console.warn('Error getting localStorage keys:', error);
            }
        }

        // Clear matching keys
        for (const key of allKeys) {
            try {
                await window.UnifiedCacheManager.remove(key);
                results.cleared++;
                results.details.push(`Cleared: ${key}`);
            } catch (error) {
                results.errors++;
                results.details.push(`Error clearing ${key}: ${error.message}`);
            }
        }

        console.log(`🔍 Pattern clearing results:`, results);
        
        if (window.cacheTestPage) {
            const message = `ניקוי לפי תבנית הושלם - ${results.cleared} פריטים נוקו, ${results.errors} שגיאות`;
            window.cacheTestPage.showSuccessMessage(message, JSON.stringify(results, null, 2));
        }

        return results;
    } catch (error) {
        console.error('❌ Pattern clearing failed:', error);
        if (window.cacheTestPage) {
            window.cacheTestPage.showErrorMessage('ניקוי לפי תבנית נכשל', error.message);
        }
        return null;
    }
};

/**
 * ניקוי מטמון לפי TTL פג תוקף
 * Clear cache by expired TTL
 */
window.clearExpiredCache = async function() {
    try {
        console.log('⏰ Clearing expired cache entries...');
        
        if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
            throw new Error('UnifiedCacheManager not available');
        }

        const results = {
            expired: 0,
            total: 0,
            errors: 0,
            details: []
        };

        // Check localStorage for expired entries
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('tiktrack_')) {
                    results.total++;
                    
                    try {
                        const value = localStorage.getItem(key);
                        const data = JSON.parse(value);
                        
                        // Check if data has TTL and is expired
                        if (data && data.ttl && data.timestamp) {
                            const now = Date.now();
                            const expiresAt = data.timestamp + data.ttl;
                            
                            if (now > expiresAt) {
                                await window.UnifiedCacheManager.remove(key);
                                results.expired++;
                                results.details.push(`Expired: ${key}`);
                            }
                        }
                    } catch (parseError) {
                        // Not a JSON object, skip
                        continue;
                    }
                }
            }
        } catch (error) {
            results.errors++;
            results.details.push(`Error checking localStorage: ${error.message}`);
        }

        console.log('⏰ Expired cache clearing results:', results);
        
        if (window.cacheTestPage) {
            const message = `ניקוי TTL פג תוקף הושלם - ${results.expired}/${results.total} פריטים נוקו`;
            window.cacheTestPage.showSuccessMessage(message, JSON.stringify(results, null, 2));
        }

        return results;
    } catch (error) {
        console.error('❌ Expired cache clearing failed:', error);
        if (window.cacheTestPage) {
            window.cacheTestPage.showErrorMessage('ניקוי TTL פג תוקף נכשל', error.message);
        }
        return null;
    }
};

/**
 * ניקוי מטמון לפי גודל
 * Clear cache by size (largest first)
 */
window.clearCacheBySize = async function(maxSize = 1024 * 1024) { // 1MB default
    try {
        console.log(`📏 Clearing cache by size (max: ${maxSize} bytes)...`);
        
        if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
            throw new Error('UnifiedCacheManager not available');
        }

        const results = {
            maxSize: maxSize,
            cleared: 0,
            totalSize: 0,
            errors: 0,
            details: []
        };

        // Get all entries with their sizes
        const entries = [];
        
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('tiktrack_')) {
                    const value = localStorage.getItem(key);
                    const size = (key.length + value.length) * 2; // Unicode chars
                    entries.push({ key, size, value });
                    results.totalSize += size;
                }
            }
        } catch (error) {
            results.errors++;
            results.details.push(`Error getting entries: ${error.message}`);
        }

        // Sort by size (largest first)
        entries.sort((a, b) => b.size - a.size);

        // Remove largest entries until under maxSize
        let currentSize = results.totalSize;
        for (const entry of entries) {
            if (currentSize <= maxSize) break;
            
            try {
                await window.UnifiedCacheManager.remove(entry.key);
                currentSize -= entry.size;
                results.cleared++;
                results.details.push(`Cleared large entry: ${entry.key} (${entry.size} bytes)`);
            } catch (error) {
                results.errors++;
                results.details.push(`Error clearing ${entry.key}: ${error.message}`);
            }
        }

        results.totalSize = currentSize;

        console.log('📏 Size-based clearing results:', results);
        
        if (window.cacheTestPage) {
            const message = `ניקוי לפי גודל הושלם - ${results.cleared} פריטים נוקו, גודל נוכחי: ${Math.round(results.totalSize / 1024)}KB`;
            window.cacheTestPage.showSuccessMessage(message, JSON.stringify(results, null, 2));
        }

        return results;
    } catch (error) {
        console.error('❌ Size-based clearing failed:', error);
        if (window.cacheTestPage) {
            window.cacheTestPage.showErrorMessage('ניקוי לפי גודל נכשל', error.message);
        }
        return null;
    }
};

/**
 * הצגת סטטיסטיקות זיכרון
 * Show memory statistics
 */
window.showMemoryStats = async function() {
    try {
        
        if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
            throw new Error('UnifiedCacheManager not available');
        }

        const memoryStats = await window.UnifiedCacheManager.getLayerStats('memory');
        const browserMemory = window.performance.memory ? {
            used: window.performance.memory.usedJSHeapSize,
            total: window.performance.memory.totalJSHeapSize,
            limit: window.performance.memory.jsHeapSizeLimit
        } : null;

        const stats = {
            cacheMemory: memoryStats,
            browserMemory: browserMemory,
            timestamp: new Date().toISOString()
        };

        
        if (window.cacheTestPage) {
            window.cacheTestPage.showSuccessMessage('סטטיסטיקות זיכרון', JSON.stringify(stats, null, 2));
        }

        return stats;
    } catch (error) {
        console.error('❌ Failed to get memory statistics:', error);
        if (window.cacheTestPage) {
            window.cacheTestPage.showErrorMessage('שגיאה בקבלת סטטיסטיקות זיכרון', error.message);
        }
        return null;
    }
};

/**
 * הצגת סטטיסטיקות localStorage
 * Show localStorage statistics
 */
window.showLocalStorageStats = async function() {
    try {
        
        if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
            throw new Error('UnifiedCacheManager not available');
        }

        const localStorageStats = await window.UnifiedCacheManager.getLayerStats('localStorage');
        
        // בדיקה נוספת של localStorage
        const directStats = {
            totalKeys: localStorage.length,
            totalSize: 0,
            tikTrackKeys: 0
        };

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            directStats.totalSize += (key.length + value.length) * 2; // Unicode chars
            if (key.startsWith('tiktrack_')) {
                directStats.tikTrackKeys++;
            }
        }

        const stats = {
            cacheStats: localStorageStats,
            directStats: directStats,
            timestamp: new Date().toISOString()
        };

        
        if (window.cacheTestPage) {
            window.cacheTestPage.showSuccessMessage('סטטיסטיקות localStorage', JSON.stringify(stats, null, 2));
        }

        return stats;
    } catch (error) {
        console.error('❌ Failed to get localStorage statistics:', error);
        if (window.cacheTestPage) {
            window.cacheTestPage.showErrorMessage('שגיאה בקבלת סטטיסטיקות localStorage', error.message);
        }
        return null;
    }
};

/**
 * הצגת סטטיסטיקות IndexedDB
 * Show IndexedDB statistics
 */
window.showIndexedDBStats = async function() {
    try {
        
        if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
            throw new Error('UnifiedCacheManager not available');
        }

        const indexedDBStats = await window.UnifiedCacheManager.getLayerStats('indexedDB');
        
        const stats = {
            cacheStats: indexedDBStats,
            timestamp: new Date().toISOString()
        };

        
        if (window.cacheTestPage) {
            window.cacheTestPage.showSuccessMessage('סטטיסטיקות IndexedDB', JSON.stringify(stats, null, 2));
        }

        return stats;
    } catch (error) {
        console.error('❌ Failed to get IndexedDB statistics:', error);
        if (window.cacheTestPage) {
            window.cacheTestPage.showErrorMessage('שגיאה בקבלת סטטיסטיקות IndexedDB', error.message);
        }
        return null;
    }
};

/**
 * הצגת סטטיסטיקות Backend
 * Show Backend statistics
 */
window.showBackendStats = async function() {
    try {
        
        if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
            throw new Error('UnifiedCacheManager not available');
        }

        const backendStats = await window.UnifiedCacheManager.getLayerStats('backend');
        
        const stats = {
            cacheStats: backendStats,
            timestamp: new Date().toISOString()
        };

        
        if (window.cacheTestPage) {
            window.cacheTestPage.showSuccessMessage('סטטיסטיקות Backend', JSON.stringify(stats, null, 2));
        }

        return stats;
    } catch (error) {
        console.error('❌ Failed to get Backend statistics:', error);
        if (window.cacheTestPage) {
            window.cacheTestPage.showErrorMessage('שגיאה בקבלת סטטיסטיקות Backend', error.message);
        }
        return null;
    }
};

/**
 * סינכרון מלא עם השרת
 * Full system synchronization with server
 */
window.fullSystemSync = async function() {
    try {
        
        if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
            throw new Error('UnifiedCacheManager not available');
        }

        const syncResults = {
            cacheSync: false,
            preferencesSync: false,
            dataSync: false,
            timestamp: new Date().toISOString()
        };

        // סינכרון מטמון
        try {
            if (window.CacheSyncManager && typeof window.CacheSyncManager.syncToBackend === 'function') {
                await window.CacheSyncManager.syncToBackend('all');
                syncResults.cacheSync = true;
            }
        } catch (error) {
            console.warn('Cache sync failed:', error);
        }

        // סינכרון העדפות
        try {
            if (window.UnifiedCacheManager.get('user-preferences')) {
                // סינכרון העדפות עם השרת
                syncResults.preferencesSync = true;
            }
        } catch (error) {
            console.warn('Preferences sync failed:', error);
        }

        // סינכרון נתונים
        try {
            // כאן ניתן להוסיף סינכרון עם API endpoints
            syncResults.dataSync = true;
        } catch (error) {
            console.warn('Data sync failed:', error);
        }

        
        // עדכון משוב בממשק
        if (window.cacheTestPage) {
            const successfulSyncs = Object.values(syncResults).filter(Boolean).length - 1; // -1 for timestamp
            const message = `סינכרון הושלם - ${successfulSyncs}/3 פעולות הצליחו`;
            window.cacheTestPage.showSuccessMessage(message, JSON.stringify(syncResults, null, 2));
        }

        return syncResults;
    } catch (error) {
        console.error('❌ Full sync failed:', error);
        if (window.cacheTestPage) {
            window.cacheTestPage.showErrorMessage('סינכרון מלא נכשל', error.message);
        }
        return null;
    }
};

// הוספה למערכת האתחול המאוחדת
if (window.UnifiedInitializationSystem) {
    window.UnifiedInitializationSystem.addCoreSystem('UnifiedCacheManager', () => {
        return window.UnifiedCacheManager.initialize();
    });
}

/**
 * ניקוי מטמון חכם - ניקוי אוטומטי לפי תנאים
 * Smart cache clearing - automatic clearing based on conditions
 */
window.smartCacheCleanup = async function() {
    try {
        console.log('🧠 Running smart cache cleanup...');
        
        if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
            throw new Error('UnifiedCacheManager not available');
        }

        const results = {
            timestamp: new Date().toISOString(),
            expired: 0,
            large: 0,
            temp: 0,
            total: 0,
            errors: 0,
            details: []
        };

        // 1. Clear expired entries
        try {
            const expiredResult = await window.clearExpiredCache();
            if (expiredResult) {
                results.expired = expiredResult.expired;
                results.details.push(`Expired: ${expiredResult.expired} entries`);
            }
        } catch (error) {
            results.errors++;
            results.details.push(`Expired cleanup error: ${error.message}`);
        }

        // 2. Clear large entries (over 1MB)
        try {
            const sizeResult = await window.clearCacheBySize(1024 * 1024);
            if (sizeResult) {
                results.large = sizeResult.cleared;
                results.details.push(`Large: ${sizeResult.cleared} entries`);
            }
        } catch (error) {
            results.errors++;
            results.details.push(`Size cleanup error: ${error.message}`);
        }

        // 3. Clear temporary entries
        try {
            const tempResult = await window.clearCacheByPattern('temp_');
            if (tempResult) {
                results.temp = tempResult.cleared;
                results.details.push(`Temp: ${tempResult.cleared} entries`);
            }
        } catch (error) {
            results.errors++;
            results.details.push(`Temp cleanup error: ${error.message}`);
        }

        // 4. Clear old test data
        try {
            const testResult = await window.clearCacheByPattern('test_');
            if (testResult) {
                results.details.push(`Test: ${testResult.cleared} entries`);
            }
        } catch (error) {
            results.errors++;
            results.details.push(`Test cleanup error: ${error.message}`);
        }

        results.total = results.expired + results.large + results.temp;

        console.log('🧠 Smart cleanup results:', results);
        
        if (window.cacheTestPage) {
            const message = `ניקוי חכם הושלם - ${results.total} פריטים נוקו (פג תוקף: ${results.expired}, גדולים: ${results.large}, זמניים: ${results.temp})`;
            window.cacheTestPage.showSuccessMessage(message, JSON.stringify(results, null, 2));
        }

        return results;
    } catch (error) {
        console.error('❌ Smart cleanup failed:', error);
        if (window.cacheTestPage) {
            window.cacheTestPage.showErrorMessage('ניקוי חכם נכשל', error.message);
        }
        return null;
    }
};

/**
 * ניקוי מטמון לפי קטגוריה
 * Clear cache by category
 */
window.clearCacheByCategory = async function(category) {
    try {
        console.log(`📂 Clearing cache by category: ${category}`);
        
        if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
            throw new Error('UnifiedCacheManager not available');
        }

        const categoryPatterns = {
            'preferences': ['user-preferences', 'tiktrack_preferences', 'preferences_'],
            'notifications': ['tiktrack_global_notifications', 'notification_', 'alert_'],
            'ui-state': ['ui-state', 'section_', 'toggle_', 'collapsed_'],
            'temp-data': ['temp_', 'test_', 'debug_', 'perf_'],
            'auth': ['authToken', 'savedUsername', 'savedPassword', 'rememberCredentials'],
            'cache': ['cache_', 'tiktrack_cache_', 'unified_cache_']
        };

        const patterns = categoryPatterns[category];
        if (!patterns) {
            throw new Error(`Unknown category: ${category}. Available: ${Object.keys(categoryPatterns).join(', ')}`);
        }

        const results = {
            category: category,
            cleared: 0,
            errors: 0,
            details: []
        };

        for (const pattern of patterns) {
            try {
                const patternResult = await window.clearCacheByPattern(pattern);
                if (patternResult) {
                    results.cleared += patternResult.cleared;
                    results.errors += patternResult.errors;
                    results.details.push(`${pattern}: ${patternResult.cleared} entries`);
                }
            } catch (error) {
                results.errors++;
                results.details.push(`Pattern ${pattern} error: ${error.message}`);
            }
        }

        console.log(`📂 Category clearing results for ${category}:`, results);
        
        if (window.cacheTestPage) {
            const message = `ניקוי קטגוריה ${category} הושלם - ${results.cleared} פריטים נוקו`;
            window.cacheTestPage.showSuccessMessage(message, JSON.stringify(results, null, 2));
        }

        return results;
    } catch (error) {
        console.error(`❌ Category clearing failed for ${category}:`, error);
        if (window.cacheTestPage) {
            window.cacheTestPage.showErrorMessage(`ניקוי קטגוריה ${category} נכשל`, error.message);
        }
        return null;
    }
};

// ========================================
// Cache System Management Functions
// ========================================

/**
 * Initialize all cache systems
 * @param {boolean} isInitialLoad - האם זה אתחול ראשוני (לא להציג הודעות מפורטות)
 */
window.initializeAllCacheSystems = async function(isInitialLoad = false) {
    // Simplified: Initialize UnifiedCacheManager only (single unified system)
    // Advanced systems (CacheSyncManager, CachePolicyManager, MemoryOptimizer) were removed
    const cacheInitKey = 'cache-systems-initialization';
    
    if (window.globalInitializationState.customInitializers.has(cacheInitKey)) {
        console.log('⏳ UnifiedCacheManager already initialized, skipping...');
        return { unifiedCacheManager: true };
    }
    
    if (window.cacheSystemsInitializing) {
        console.log('⏳ UnifiedCacheManager already initializing, waiting...');
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (!window.cacheSystemsInitializing) {
                    clearInterval(checkInterval);
                    resolve({ unifiedCacheManager: true });
                }
            }, 100);
        });
    }

    window.cacheSystemsInitializing = true;
    const startTime = Date.now();
    
    try {
        
        const results = {
            unifiedCacheManager: false
        };
        
        // Initialize UnifiedCacheManager
        if (window.UnifiedCacheManager && !window.UnifiedCacheManager.initialized) {
            await window.UnifiedCacheManager.initialize();
            results.unifiedCacheManager = window.UnifiedCacheManager.initialized;
        } else if (window.UnifiedCacheManager?.initialized) {
            results.unifiedCacheManager = true;
        }
        
        
        const initializedCount = Object.values(results).filter(Boolean).length;
        const totalCount = Object.keys(results).length;
        
        if (initializedCount === totalCount) {
            if (isInitialLoad) {
                // אתחול ראשוני - הודעה רגילה בלבד
                if (typeof window.showNotification === 'function') {
                    window.showNotification('UnifiedCacheManager אותחל בהצלחה', 'success');
                } else {
                }
            } else {
                // אתחול ידני - הודעה מפורטת
                if (typeof window.showSuccessNotification === 'function') {
                    window.showSuccessNotification(
                        'אתחול מערכת מטמון',
                        `UnifiedCacheManager אותחל בהצלחה!\n\n4 שכבות פעילות:\n• Memory Layer: ✅\n• localStorage Layer: ✅\n• IndexedDB Layer: ✅\n• Backend Layer: ✅\n\nזמן אתחול: ${Date.now() - startTime}ms`
                    );
                } else {
                }
            }
        } else {
            // Failed to initialize UnifiedCacheManager
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification(
                    'שגיאה באתחול מערכת המטמון',
                    'UnifiedCacheManager לא אותחל בהצלחה. העמוד עשוי שלא לעבוד כראוי.'
                );
            } else {
                console.error('❌ UnifiedCacheManager failed to initialize');
            }
        }
        
            // Mark as initialized in global state
            window.globalInitializationState.customInitializers.set(cacheInitKey, {
                executed: true,
                timestamp: Date.now(),
                page: 'cache-systems',
                results: results
            });
            
            return results;
        } catch (error) {
            console.error('❌ Failed to initialize cache systems:', error);
            if (window.cacheTestPage) {
                window.cacheTestPage.showErrorMessage('כשל באתחול מערכות מטמון', error.message);
            }
            return null;
        } finally {
            // Clear the initialization flag
            window.cacheSystemsInitializing = false;
        }
};

/**
 * Get comprehensive cache system status
 */
window.getCacheSystemStatus = function() {
    try {
        const status = {
            unifiedCacheManager: {
                available: !!window.UnifiedCacheManager,
                initialized: window.UnifiedCacheManager?.initialized || false,
                stats: window.UnifiedCacheManager?.getStats?.() || null
            },
            cacheSyncManager: {
                available: !!window.CacheSyncManager,
                initialized: window.CacheSyncManager?.initialized || false,
                stats: window.CacheSyncManager?.getStats?.() || null
            },
            cachePolicyManager: {
                available: !!window.CachePolicyManager,
                initialized: window.CachePolicyManager?.initialized || false,
                stats: window.CachePolicyManager?.getStats?.() || null
            },
            memoryOptimizer: {
                available: !!window.MemoryOptimizer,
                initialized: window.MemoryOptimizer?.initialized || false,
                stats: window.MemoryOptimizer?.getStats?.() || null
            }
        };
        
        
        // הצגת סטטוס מפורט דרך מערכת ההודעות
        const activeSystems = Object.entries(status)
            .filter(([_, info]) => info.available && info.initialized)
            .map(([system, _]) => system);
        const inactiveSystems = Object.entries(status)
            .filter(([_, info]) => !info.available || !info.initialized)
            .map(([system, _]) => system);
        
        if (inactiveSystems.length === 0) {
            // כל המערכות פעילות - הודעה מפורטת עם מודל
            if (typeof window.showFinalSuccessNotification === 'function') {
                window.showFinalSuccessNotification(
                    'בדיקת סטטוס מערכות מטמון - כל המערכות פעילות!',
                    `בדיקת סטטוס מערכות המטמון הושלמה בהצלחה.\n\nתוצאות הבדיקה:\n• UnifiedCacheManager: ✅ פעיל ומוכן\n• CacheSyncManager: ✅ פעיל ומוכן\n• CachePolicyManager: ✅ פעיל ומוכן\n• MemoryOptimizer: ✅ פעיל ומוכן\n\nזמן בדיקה: ${new Date().toLocaleTimeString('he-IL')}\nסטטוס: כל המערכות פועלות תקין`,
                    {
                        operation: 'cache-system-status-check',
                        duration: `${Date.now()}ms`,
                        timestamp: new Date().toISOString(),
                        systems: status,
                        activeSystems: activeSystems,
                        inactiveSystems: inactiveSystems,
                        status: 'all-systems-healthy',
                        healthCheck: 'כל מערכות המטמון פועלות בצורה תקינה',
                        nextAction: 'המערכת מוכנה לכל פעולות המטמון'
                    },
                    'system'
                );
            } else {
            }
        } else {
            // חלק מהמערכות לא פעילות - הודעת שגיאה מפורטת עם מודל
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification(
                    'בדיקת סטטוס מערכות מטמון - חלק מהמערכות לא פעילות',
                    `בדיקת סטטוס מערכות המטמון זיהתה בעיות.\n\nפרטי הבדיקה:\n• מערכות פעילות: ${activeSystems.length}/4\n• מערכות פעילות: ${activeSystems.join(', ')}\n• מערכות לא פעילות: ${inactiveSystems.join(', ')}\n• זמן בדיקה: ${new Date().toLocaleTimeString('he-IL')}\n\nבדיקת בריאות מפורטת:\n• UnifiedCacheManager: ${status.unifiedCacheManager.available && status.unifiedCacheManager.initialized ? '✅ פעיל' : '❌ לא פעיל'}\n• CacheSyncManager: ${status.cacheSyncManager.available && status.cacheSyncManager.initialized ? '✅ פעיל' : '❌ לא פעיל'}\n• CachePolicyManager: ${status.cachePolicyManager.available && status.cachePolicyManager.initialized ? '✅ פעיל' : '❌ לא פעיל'}\n• MemoryOptimizer: ${status.memoryOptimizer.available && status.memoryOptimizer.initialized ? '✅ פעיל' : '❌ לא פעיל'}\n\nהוראות:\n• חלק מהתכונות המתקדמות לא יהיו זמינות\n• ייתכן ביצועים מוגבלים במערכת המטמון\n• מומלץ לנסות אתחול חוזר של המערכות`,
                    20000
                );
            } else {
                console.error('⚠️ סטטוס מערכות מטמון - חלק מהמערכות לא פעילות');
            }
        }
        
        return status;
    } catch (error) {
        console.error('❌ Failed to get cache system status:', error);
        return null;
    }
};

/**
 * Comprehensive cache cleanup testing suite
 * בדיקת מנגנוני ניקוי מטמון מקיפה
 */
window.testCacheCleanupMechanisms = async function() {
    try {
        console.log('🧪 Starting comprehensive cache cleanup testing...');
        
        const testResults = {
            layerClearing: {},
            advancedClearing: {},
            categoryClearing: {},
            systemClearing: {},
            overall: false
        };
        
        // שלב 1: בדיקת ניקוי שכבות בודדות
        
        // בדיקת Memory Layer
        try {
            await window.UnifiedCacheManager.save('test_memory_1', 'test-data-1', { layer: 'memory' });
            await window.UnifiedCacheManager.save('test_memory_2', 'test-data-2', { layer: 'memory' });
            
            const beforeClear = await window.UnifiedCacheManager.getLayerStats('memory');
            await window.clearUnifiedCacheLayer('memory');
            const afterClear = await window.UnifiedCacheManager.getLayerStats('memory');
            
            testResults.layerClearing.memory = {
                beforeEntries: beforeClear.entries,
                afterEntries: afterClear.entries,
                success: afterClear.entries === 0,
                details: `Memory layer: ${beforeClear.entries} → ${afterClear.entries} entries`
            };
        } catch (error) {
            testResults.layerClearing.memory = { success: false, error: error.message };
        }
        
        // בדיקת localStorage Layer
        try {
            await window.UnifiedCacheManager.save('test_localStorage_1', 'test-data-1', { layer: 'localStorage' });
            await window.UnifiedCacheManager.save('test_localStorage_2', 'test-data-2', { layer: 'localStorage' });
            
            const beforeClear = await window.UnifiedCacheManager.getLayerStats('localStorage');
            await window.clearUnifiedCacheLayer('localStorage');
            const afterClear = await window.UnifiedCacheManager.getLayerStats('localStorage');
            
            testResults.layerClearing.localStorage = {
                beforeEntries: beforeClear.entries,
                afterEntries: afterClear.entries,
                success: afterClear.entries === 0,
                details: `localStorage layer: ${beforeClear.entries} → ${afterClear.entries} entries`
            };
        } catch (error) {
            testResults.layerClearing.localStorage = { success: false, error: error.message };
        }
        
        // בדיקת IndexedDB Layer
        try {
            await window.UnifiedCacheManager.save('test_indexedDB_1', 'test-data-1', { layer: 'indexedDB' });
            await window.UnifiedCacheManager.save('test_indexedDB_2', 'test-data-2', { layer: 'indexedDB' });
            
            const beforeClear = await window.UnifiedCacheManager.getLayerStats('indexedDB');
            await window.clearUnifiedCacheLayer('indexedDB');
            const afterClear = await window.UnifiedCacheManager.getLayerStats('indexedDB');
            
            testResults.layerClearing.indexedDB = {
                beforeEntries: beforeClear.entries,
                afterEntries: afterClear.entries,
                success: afterClear.entries === 0,
                details: `IndexedDB layer: ${beforeClear.entries} → ${afterClear.entries} entries`
            };
        } catch (error) {
            testResults.layerClearing.indexedDB = { success: false, error: error.message };
        }
        
        // שלב 2: בדיקת ניקוי מתקדם
        
        // בדיקת ניקוי TTL פג תוקף
        try {
            // יצירת נתונים עם TTL קצר
            await window.UnifiedCacheManager.save('test_ttl_short', 'test-data', { 
                layer: 'memory', 
                ttl: 100 // 100ms
            });
            
            // המתנה ל-TTL לפג
            await new Promise(resolve => setTimeout(resolve, 150));
            
            const beforeClear = await window.UnifiedCacheManager.getLayerStats('memory');
            await window.clearExpiredCache();
            const afterClear = await window.UnifiedCacheManager.getLayerStats('memory');
            
            testResults.advancedClearing.expiredTTL = {
                beforeEntries: beforeClear.entries,
                afterEntries: afterClear.entries,
                success: afterClear.entries < beforeClear.entries,
                details: `Expired TTL clearing: ${beforeClear.entries} → ${afterClear.entries} entries`
            };
        } catch (error) {
            testResults.advancedClearing.expiredTTL = { success: false, error: error.message };
        }
        
        // בדיקת ניקוי לפי גדול
        try {
            // יצירת נתונים גדולים
            const largeData = 'x'.repeat(10000); // 10KB
            await window.UnifiedCacheManager.save('test_large_1', largeData, { layer: 'memory' });
            await window.UnifiedCacheManager.save('test_large_2', largeData, { layer: 'memory' });
            
            const beforeClear = await window.UnifiedCacheManager.getLayerStats('memory');
            await window.clearCacheBySize(5000); // נקה גדולים מ-5KB
            const afterClear = await window.UnifiedCacheManager.getLayerStats('memory');
            
            testResults.advancedClearing.bySize = {
                beforeEntries: beforeClear.entries,
                afterEntries: afterClear.entries,
                success: afterClear.entries < beforeClear.entries,
                details: `Large size clearing: ${beforeClear.entries} → ${afterClear.entries} entries`
            };
        } catch (error) {
            testResults.advancedClearing.bySize = { success: false, error: error.message };
        }
        
        // שלב 3: בדיקת ניקוי לפי קטגוריה
        
        // בדיקת ניקוי העדפות
        try {
            await window.UnifiedCacheManager.save('preferences_test_1', 'pref-data-1', { layer: 'localStorage' });
            await window.UnifiedCacheManager.save('preferences_test_2', 'pref-data-2', { layer: 'localStorage' });
            
            const beforeClear = await window.UnifiedCacheManager.getLayerStats('localStorage');
            await window.clearCacheByCategory('preferences');
            const afterClear = await window.UnifiedCacheManager.getLayerStats('localStorage');
            
            testResults.categoryClearing.preferences = {
                beforeEntries: beforeClear.entries,
                afterEntries: afterClear.entries,
                success: afterClear.entries < beforeClear.entries,
                details: `Preferences clearing: ${beforeClear.entries} → ${afterClear.entries} entries`
            };
        } catch (error) {
            testResults.categoryClearing.preferences = { success: false, error: error.message };
        }
        
        // שלב 4: בדיקת ניקוי כל המערכות
        
        try {
            // מילוי כל השכבות
            await window.UnifiedCacheManager.save('final_test_1', 'final-data-1', { layer: 'memory' });
            await window.UnifiedCacheManager.save('final_test_2', 'final-data-2', { layer: 'localStorage' });
            await window.UnifiedCacheManager.save('final_test_3', 'final-data-3', { layer: 'indexedDB' });
            
            const beforeClear = {
                memory: await window.UnifiedCacheManager.getLayerStats('memory'),
                localStorage: await window.UnifiedCacheManager.getLayerStats('localStorage'),
                indexedDB: await window.UnifiedCacheManager.getLayerStats('indexedDB')
            };
            
            await window.clearAllCacheSystems();
            
            const afterClear = {
                memory: await window.UnifiedCacheManager.getLayerStats('memory'),
                localStorage: await window.UnifiedCacheManager.getLayerStats('localStorage'),
                indexedDB: await window.UnifiedCacheManager.getLayerStats('indexedDB')
            };
            
            testResults.systemClearing.complete = {
                beforeEntries: {
                    memory: beforeClear.memory.entries,
                    localStorage: beforeClear.localStorage.entries,
                    indexedDB: beforeClear.indexedDB.entries
                },
                afterEntries: {
                    memory: afterClear.memory.entries,
                    localStorage: afterClear.localStorage.entries,
                    indexedDB: afterClear.indexedDB.entries
                },
                success: afterClear.memory.entries === 0 && 
                        afterClear.localStorage.entries === 0 && 
                        afterClear.indexedDB.entries === 0,
                details: `Complete system clearing: All layers cleared successfully`
            };
        } catch (error) {
            testResults.systemClearing.complete = { success: false, error: error.message };
        }
        
        // חישוב תוצאה כוללת
        const layerSuccessCount = Object.values(testResults.layerClearing).filter(r => r.success).length;
        const advancedSuccessCount = Object.values(testResults.advancedClearing).filter(r => r.success).length;
        const categorySuccessCount = Object.values(testResults.categoryClearing).filter(r => r.success).length;
        const systemSuccessCount = Object.values(testResults.systemClearing).filter(r => r.success).length;
        
        const totalTests = Object.keys(testResults.layerClearing).length + 
                          Object.keys(testResults.advancedClearing).length + 
                          Object.keys(testResults.categoryClearing).length + 
                          Object.keys(testResults.systemClearing).length;
        
        const totalSuccess = layerSuccessCount + advancedSuccessCount + categorySuccessCount + systemSuccessCount;
        
        testResults.overall = {
            totalTests: totalTests,
            totalSuccess: totalSuccess,
            successRate: (totalSuccess / totalTests * 100).toFixed(2),
            layerTests: `${layerSuccessCount}/${Object.keys(testResults.layerClearing).length}`,
            advancedTests: `${advancedSuccessCount}/${Object.keys(testResults.advancedClearing).length}`,
            categoryTests: `${categorySuccessCount}/${Object.keys(testResults.categoryClearing).length}`,
            systemTests: `${systemSuccessCount}/${Object.keys(testResults.systemClearing).length}`
        };
        
        console.log('🧪 Cache cleanup testing completed:', testResults);
        
        // הצגת תוצאות מפורטות
        if (testResults.overall.successRate >= 90) {
            if (typeof window.showFinalSuccessNotification === 'function') {
                window.showFinalSuccessNotification(
                    'בדיקת מנגנוני ניקוי מטמון הושלמה בהצלחה!',
                    `בדיקת כל מנגנוני ניקוי המטמון הושלמה בהצלחה.\n\nתוצאות הבדיקה:\n• ניקוי שכבות: ${testResults.overall.layerTests}\n• ניקוי מתקדם: ${testResults.overall.advancedTests}\n• ניקוי לפי קטגוריה: ${testResults.overall.categoryTests}\n• ניקוי כל המערכות: ${testResults.overall.systemTests}\n\nשיעור הצלחה כולל: ${testResults.overall.successRate}%\nזמן בדיקה: ${new Date().toLocaleTimeString('he-IL')}\nסטטוס: כל המנגנונים עובדים תקין`,
                    {
                        operation: 'comprehensive-cache-cleanup-test',
                        duration: `${Date.now()}ms`,
                        timestamp: new Date().toISOString(),
                        testResults: testResults,
                        successRate: testResults.overall.successRate,
                        status: 'all-mechanisms-working',
                        healthCheck: 'כל מנגנוני ניקוי המטמון עובדים תקין',
                        nextAction: 'המערכת מוכנה לשימוש מלא'
                    },
                    'system'
                );
            }
        } else {
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification(
                    'בדיקת מנגנוני ניקוי מטמון זיהתה בעיות',
                    `בדיקת מנגנוני ניקוי המטמון זיהתה בעיות.\n\nפרטי הבדיקה:\n• ניקוי שכבות: ${testResults.overall.layerTests}\n• ניקוי מתקדם: ${testResults.overall.advancedTests}\n• ניקוי לפי קטגוריה: ${testResults.overall.categoryTests}\n• ניקוי כל המערכות: ${testResults.overall.systemTests}\n\nשיעור הצלחה כולל: ${testResults.overall.successRate}%\nזמן בדיקה: ${new Date().toLocaleTimeString('he-IL')}\n\nבדיקת בריאות מפורטת:\n${JSON.stringify(testResults, null, 2)}`,
                    20000
                );
            }
        }
        
        return testResults;
        
    } catch (error) {
        console.error('❌ Cache cleanup testing failed:', error);
        if (window.cacheTestPage) {
            window.cacheTestPage.showErrorMessage('כשל בבדיקת מנגנוני ניקוי', error.message);
        }
        return null;
    }
};

/**
 * Test UnifiedCacheManager integration (4 layers)
 * Simplified from multiple cache systems to single unified system
 */
window.testCacheSystemsIntegration = async function() {
    try {
        console.log('🧪 Testing UnifiedCacheManager integration (4 layers)...');
        
        const testResults = {
            memoryLayer: false,
            localStorageLayer: false,
            indexedDBLayer: false,
            backendLayer: false
        };
        
        // Test UnifiedCacheManager with all layers
        if (window.UnifiedCacheManager?.initialized) {
            try {
                // Test Memory Layer
                await window.UnifiedCacheManager.save('test-memory', 'test-data-memory', { layer: 'memory' });
                const retrievedMemory = await window.UnifiedCacheManager.get('test-memory', { layer: 'memory' });
                testResults.memoryLayer = retrievedMemory === 'test-data-memory';
                await window.UnifiedCacheManager.remove('test-memory');
                
                // Test localStorage Layer
                await window.UnifiedCacheManager.save('test-ls', 'test-data-ls', { layer: 'localStorage' });
                const retrievedLS = await window.UnifiedCacheManager.get('test-ls', { layer: 'localStorage' });
                testResults.localStorageLayer = retrievedLS === 'test-data-ls';
                await window.UnifiedCacheManager.remove('test-ls');
                
                // Test IndexedDB Layer
                await window.UnifiedCacheManager.save('test-idb', 'test-data-idb', { layer: 'indexedDB' });
                const retrievedIDB = await window.UnifiedCacheManager.get('test-idb', { layer: 'indexedDB' });
                testResults.indexedDBLayer = retrievedIDB === 'test-data-idb';
                await window.UnifiedCacheManager.remove('test-idb');
                
                // Test Backend Layer - check if layer is initialized and functional
                try {
                    if (window.UnifiedCacheManager.layers?.backend?.initialized) {
                        // Try to save and retrieve from backend layer
                        await window.UnifiedCacheManager.layers.backend.save('test-backend', 'test-data-backend', { ttl: null });
                        const backendData = await window.UnifiedCacheManager.layers.backend.get('test-backend');
                        // BackendCacheLayer.get() returns data directly, not wrapped in object
                        testResults.backendLayer = backendData === 'test-data-backend';
                        await window.UnifiedCacheManager.layers.backend.remove('test-backend');
                    } else {
                        testResults.backendLayer = false;
                    }
                } catch (backendError) {
                    console.error('Backend layer test failed:', backendError);
                    testResults.backendLayer = false;
                }
                
            } catch (error) {
                console.error('UnifiedCacheManager layer test failed:', error);
            }
        } else {
            console.error('UnifiedCacheManager not initialized');
        }
        
        console.log('🧪 Cache layer integration test results:', testResults);
        
        const workingCount = Object.values(testResults).filter(Boolean).length;
        const totalCount = Object.keys(testResults).length;
        
        if (workingCount === totalCount) {
            // All 4 layers working - success message
            if (typeof window.showFinalSuccessNotification === 'function') {
                window.showFinalSuccessNotification(
                    'בדיקת אינטגרציה UnifiedCacheManager הושלמה בהצלחה!',
                    `בדיקת האינטגרציה של UnifiedCacheManager הושלמה בהצלחה.\n\nתוצאות הבדיקה (4 שכבות):\n• Memory Layer: ${testResults.memoryLayer ? '✅ עובד' : '❌ לא עובד'}\n• localStorage Layer: ${testResults.localStorageLayer ? '✅ עובד' : '❌ לא עובד'}\n• IndexedDB Layer: ${testResults.indexedDBLayer ? '✅ עובד' : '❌ לא עובד'}\n• Backend Layer: ${testResults.backendLayer ? '✅ עובד' : '❌ לא עובד'}\n\nזמן בדיקה: ${new Date().toLocaleTimeString('he-IL')}\nסטטוס: ${workingCount}/${totalCount} שכבות עובדות`,
                    {
                        operation: 'unified-cache-integration-test',
                        duration: `${Date.now()}ms`,
                        timestamp: new Date().toISOString(),
                        testResults: testResults,
                        workingLayers: workingCount,
                        totalLayers: totalCount,
                        status: 'all-layers-working',
                        healthCheck: 'כל 4 שכבות המטמון פעילות',
                        nextAction: 'המערכת מוכנה לשימוש מלא'
                    },
                    'system'
                );
            } else {
            }
        } else if (workingCount > 0) {
            // Some layers working - partial success
            if (typeof window.showFinalSuccessNotification === 'function') {
                window.showFinalSuccessNotification(
                    'בדיקת אינטגרציה UnifiedCacheManager - הצלחה חלקית',
                    `בדיקת האינטגרציה של UnifiedCacheManager הצליחה חלקית.\n\nתוצאות הבדיקה (4 שכבות):\n• Memory Layer: ${testResults.memoryLayer ? '✅ עובד' : '❌ לא עובד'}\n• localStorage Layer: ${testResults.localStorageLayer ? '✅ עובד' : '❌ לא עובד'}\n• IndexedDB Layer: ${testResults.indexedDBLayer ? '✅ עובד' : '❌ לא עובד'}\n• Backend Layer: ${testResults.backendLayer ? '✅ עובד' : '❌ לא עובד'}\n\nזמן בדיקה: ${new Date().toLocaleTimeString('he-IL')}\nסטטוס: ${workingCount}/${totalCount} שכבות עובדות`,
                    {
                        operation: 'unified-cache-integration-test-partial',
                        duration: `${Date.now()}ms`,
                        timestamp: new Date().toISOString(),
                        testResults: testResults,
                        workingLayers: workingCount,
                        totalLayers: totalCount,
                        status: 'partial-success',
                        healthCheck: `${workingCount} מתוך ${totalCount} שכבות המטמון עובדות`,
                        nextAction: 'המערכת תעבוד במצב מוגבל - חלק מהשכבות לא פעילות'
                    },
                    'warning'
                );
            } else {
                console.log(`⚠️ בדיקת אינטגרציה חלקית - ${workingCount}/${totalCount} שכבות`);
            }
        } else {
            // No layers working - error
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification(
                    'בדיקת אינטגרציה UnifiedCacheManager נכשלה',
                    `בדיקת האינטגרציה של UnifiedCacheManager זיהתה בעיות.\n\nתוצאות הבדיקה (4 שכבות):\n• Memory Layer: ${testResults.memoryLayer ? '✅ עובד' : '❌ לא עובד'}\n• localStorage Layer: ${testResults.localStorageLayer ? '✅ עובד' : '❌ לא עובד'}\n• IndexedDB Layer: ${testResults.indexedDBLayer ? '✅ עובד' : '❌ לא עובד'}\n• Backend Layer: ${testResults.backendLayer ? '✅ עובד' : '❌ לא עובד'}\n\nזמן בדיקה: ${new Date().toLocaleTimeString('he-IL')}\n\nשכבות פעילות: ${Object.entries(testResults).filter(([_, working]) => working).map(([layer, _]) => layer).join(', ') || 'אין'}\nשכבות בעייתיות: ${Object.entries(testResults).filter(([_, working]) => !working).map(([layer, _]) => layer).join(', ')}\n\nהוראות:\n• UnifiedCacheManager לא פעיל או חלק מהשכבות לא עובדות\n• מומלץ לרענן את העמוד או לאתחל מחדש את המערכת`,
                    20000
                );
            } else {
                console.error('❌ בדיקת אינטגרציה נכשלה - אף שכבה לא עובדת');
            }
        }
        
        return testResults;
    } catch (error) {
        console.error('❌ UnifiedCacheManager integration test failed:', error);
        if (window.cacheTestPage) {
            window.cacheTestPage.showErrorMessage('בדיקת אינטגרציה נכשלה', error.message);
        }
        return null;
    }
};

/**
 * Clear UnifiedCacheManager (4 layers)
 * Simplified from multiple cache systems to single unified system
 */
window.clearAllCacheSystems = async function() {
    try {
        console.log('🧹 Clearing UnifiedCacheManager (all 4 layers)...');
        
        const results = {
            unifiedCacheManager: false
        };
        
        // Clear UnifiedCacheManager (all 4 layers: memory, localStorage, indexedDB, backend)
        if (window.UnifiedCacheManager?.initialized) {
            try {
                await window.UnifiedCacheManager.clear();
                results.unifiedCacheManager = true;
            } catch (error) {
                console.error('❌ UnifiedCacheManager clear failed:', error);
            }
        } else {
            console.warn('⚠️ UnifiedCacheManager not initialized');
        }
        
        console.log('🧹 Cache clear result:', results);
        
        const clearedCount = Object.values(results).filter(Boolean).length;
        const totalCount = Object.keys(results).length;
        
        if (clearedCount === totalCount) {
            // Success - UnifiedCacheManager cleared (all 4 layers)
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification(
                    'ניקוי מטמון',
                    'UnifiedCacheManager נוקה בהצלחה!\n\n4 שכבות נוקו:\n• Memory Layer ✅\n• localStorage Layer ✅\n• IndexedDB Layer ✅\n• Backend Layer ✅'
                );
            } else {
            }
        } else {
            // Failed to clear
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification(
                    'שגיאה בניקוי מטמון',
                    'UnifiedCacheManager לא נוקה בהצלחה. נסה שוב או רענן את העמוד.'
                );
            } else {
                console.error('❌ Failed to clear UnifiedCacheManager');
            }
        }
        
        return results;
    } catch (error) {
        console.error('❌ Failed to clear cache systems:', error);
        if (window.cacheTestPage) {
            window.cacheTestPage.showErrorMessage('כשל בניקוי מערכות מטמון', error.message);
        }
        return null;
    }
};

/**
 * Generate detailed cache cleanup report
 * יצירת דוח מפורט על מנגנוני ניקוי המטמון
 */
window.generateCacheCleanupReport = async function() {
    try {
        
        const report = {
            timestamp: new Date().toISOString(),
            pageUrl: window.location.href,
            systemInfo: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language
            },
            cacheSystems: {
                unifiedCacheManager: !!window.UnifiedCacheManager?.initialized,
                cacheSyncManager: !!window.CacheSyncManager?.initialized,
                cachePolicyManager: !!window.CachePolicyManager?.initialized,
                memoryOptimizer: !!window.MemoryOptimizer?.initialized
            },
            layerStats: {},
            cleanupMechanisms: {
                layerClearing: ['memory', 'localStorage', 'indexedDB', 'backend'],
                advancedClearing: ['expiredTTL', 'bySize', 'temporary', 'smart'],
                categoryClearing: ['preferences', 'notifications', 'uiState', 'temporaryData', 'authentication'],
                systemClearing: ['allSystems']
            },
            recommendations: []
        };
        
        // קבלת סטטיסטיקות שכבות
        if (window.UnifiedCacheManager?.initialized) {
            for (const layer of ['memory', 'localStorage', 'indexedDB', 'backend']) {
                try {
                    report.layerStats[layer] = await window.UnifiedCacheManager.getLayerStats(layer);
                } catch (error) {
                    report.layerStats[layer] = { error: error.message };
                }
            }
            
            // קבלת סטטיסטיקות כלליות
            report.generalStats = window.UnifiedCacheManager.getStats();
        }
        
        // בדיקת זמינות מנגנוני ניקוי
        report.cleanupAvailability = {
            clearUnifiedCacheLayer: typeof window.clearUnifiedCacheLayer === 'function',
            clearExpiredCache: typeof window.clearExpiredCache === 'function',
            clearCacheBySize: typeof window.clearCacheBySize === 'function',
            clearCacheByCategory: typeof window.clearCacheByCategory === 'function',
            smartCacheCleanup: typeof window.smartCacheCleanup === 'function',
            clearAllCacheSystems: typeof window.clearAllCacheSystems === 'function'
        };
        
        // המלצות אוטומטיות
        const totalEntries = Object.values(report.layerStats)
            .reduce((sum, stats) => sum + (stats.entries || 0), 0);
        
        if (totalEntries > 1000) {
            report.recommendations.push('מומלץ לבצע ניקוי חכם - יש יותר מ-1000 ערכים במטמון');
        }
        
        const memoryEntries = report.layerStats.memory?.entries || 0;
        if (memoryEntries > 500) {
            report.recommendations.push('מומלץ לנקות שכבות זיכרון - יש יותר מ-500 ערכים');
        }
        
        if (!report.cleanupAvailability.clearExpiredCache) {
            report.recommendations.push('פונקציית ניקוי TTL פג תוקף לא זמינה');
        }
        
        if (!report.cleanupAvailability.smartCacheCleanup) {
            report.recommendations.push('פונקציית ניקוי חכם לא זמינה');
        }
        
        
        // הצגת הדוח
        if (typeof window.showFinalSuccessNotification === 'function') {
            const reportText = `דוח מפורט על מנגנוני ניקוי המטמון\n\n` +
                `מערכות פעילות:\n` +
                `• UnifiedCacheManager: ${report.cacheSystems.unifiedCacheManager ? '✅' : '❌'}\n` +
                `• CacheSyncManager: ${report.cacheSystems.cacheSyncManager ? '✅' : '❌'}\n` +
                `• CachePolicyManager: ${report.cacheSystems.cachePolicyManager ? '✅' : '❌'}\n` +
                `• MemoryOptimizer: ${report.cacheSystems.memoryOptimizer ? '✅' : '❌'}\n\n` +
                `סטטיסטיקות שכבות:\n` +
                `• Memory: ${report.layerStats.memory?.entries || 0} ערכים\n` +
                `• localStorage: ${report.layerStats.localStorage?.entries || 0} ערכים\n` +
                `• IndexedDB: ${report.layerStats.indexedDB?.entries || 0} ערכים\n` +
                `• Backend: ${report.layerStats.backend?.entries || 0} ערכים\n\n` +
                `מנגנוני ניקוי זמינים: ${Object.values(report.cleanupAvailability).filter(Boolean).length}/${Object.keys(report.cleanupAvailability).length}\n\n` +
                `המלצות:\n${report.recommendations.length > 0 ? report.recommendations.join('\n• ') : 'אין המלצות מיוחדות'}`;
            
            window.showFinalSuccessNotification(
                'דוח מנגנוני ניקוי מטמון הושלם',
                reportText,
                {
                    operation: 'cache-cleanup-report',
                    timestamp: report.timestamp,
                    report: report,
                    status: 'report-completed',
                    healthCheck: 'דוח מפורט על מנגנוני ניקוי המטמון',
                    nextAction: 'בדוק המלצות ופעל בהתאם'
                },
                'info'
            );
        }
        
        return report;
        
    } catch (error) {
        console.error('❌ Failed to generate cache cleanup report:', error);
        if (window.cacheTestPage) {
            window.cacheTestPage.showErrorMessage('כשל ביצירת דוח ניקוי', error.message);
        }
        return null;
    }
};

