/**
 * Unified Cache Manager - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains the unified cache management system with 4 layers:
 * Memory, localStorage, IndexedDB, and Backend Cache.
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/UNIFIED_CACHE_SYSTEM.md
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-27
 */

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
 * CACHE CLEARING HIERARCHY - תיעוד מלא
 * ========================================
 * 
 * 1. clearAllCache(options) - ניקוי מלא של כל שכבות המטמון
 *    - Memory Layer
 *    - localStorage  
 *    - sessionStorage
 *    - IndexedDB (Cache only, preserves historical data)
 *    - Backend Cache (via API)
 *    - Browser Cache (via caches.delete)
 *    
 * 2. clearAllCacheQuick() - ניקוי מהיר לפיתוח
 *    - קורא ל-clearAllCache()
 *    - Auto-refresh after 1.5 seconds
 *    - Shows notifications
 *    
 * 3. clearAllCacheDetailed() - ניקוי מפורט עם logging
 *    - קורא ל-clearAllCache()  
 *    - Detailed logging for each layer
 *    - Shows progress notifications
 *    
 * 4. refreshUserPreferences() - ניקוי ממוקד להעדפות בלבד
 *    - מוחק רק: preference_*, all_preferences_*, user-preferences
 *    - טוען מחדש preferences מהשרת
 *    - לא משפיע על שאר המטמון
 *    
 * USAGE:
 * - Full system reset: clearAllCache()
 * - Development refresh: clearAllCacheQuick()  
 * - Profile switch: refreshUserPreferences()
 * - Debug mode: clearAllCacheDetailed()
 * 
 * מחבר: TikTrack Development Team
 * תאריך יצירה: 26 בינואר 2025
 * גרסה: 1.0.0
 * ========================================
 */

// Cache Dependencies Configuration
const CACHE_DEPENDENCIES = {
    // User Level
    'user-preferences': [],
    'user-profile': ['user-preferences'],
    
    // Account Level  
    'accounts-data': ['user-preferences'],
    'account-{id}': ['accounts-data'],
    
    // Trading Level
    'trades-data': ['accounts-data'],
    'trade-{id}': ['trades-data'],
    'executions-data': ['accounts-data'],
    'execution-{id}': ['executions-data'],
    
    // Market Level
    'tickers-data': ['accounts-data'],
    'ticker-{id}': ['tickers-data'],
    'market-data': ['tickers-data'],
    'quote-{symbol}': ['market-data'],
    
    // Alerts Level
    'alerts-data': ['accounts-data'],
    'alert-{id}': ['alerts-data'],
    'conditions-data': ['trades-data'],
    
    // Dashboard Level
    'dashboard-data': ['market-data', 'trades-data', 'executions-data'],
    'statistics-data': ['trades-data', 'executions-data']
};

// TTL Policies Configuration
const TTL_POLICIES = {
    'user-preferences': 'long',      // 24 hours
    'user-profile': 'long',          // 24 hours
    'accounts-data': 'medium',       // 30 minutes
    'account-{id}': 'medium',        // 30 minutes
    'trades-data': 'short',          // 5 minutes
    'trade-{id}': 'short',           // 5 minutes
    'executions-data': 'short',      // 5 minutes
    'market-data': 'very-short',     // 1 minute
    'quote-{symbol}': 'very-short',  // 1 minute
    'dashboard-data': 'medium',      // 30 minutes
    'statistics-data': 'medium'      // 30 minutes
};

// TTL Values in milliseconds
const TTL_VALUES = {
    'very-short': 1 * 60 * 1000,     // 1 minute
    'short': 5 * 60 * 1000,          // 5 minutes
    'medium': 30 * 60 * 1000,        // 30 minutes
    'long': 24 * 60 * 60 * 1000      // 24 hours
};

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
            'preference_*': { layer: 'localStorage', ttl: 300000, compress: false }, // 5 דקות
            'all_preferences_*': { layer: 'localStorage', ttl: 300000, compress: false }, // 5 דקות
            'ui-state': { layer: 'localStorage', ttl: 3600000, compress: false },
            'filter-state': { layer: 'localStorage', ttl: 3600000, compress: false },
            'notifications-history': { layer: 'indexedDB', ttl: 86400000, compress: true },
            'file-mappings': { layer: 'indexedDB', ttl: null, compress: true },
            'linter-results': { layer: 'indexedDB', ttl: 86400000, compress: true },
            'js-analysis': { layer: 'indexedDB', ttl: 86400000, compress: true },
            'market-data': { layer: 'backend', ttl: 30000, compress: false },
            'trade-data': { layer: 'backend', ttl: 30000, compress: false },
            'dashboard-data': { layer: 'backend', ttl: 300000, compress: false },
            'trade-positions': { layer: 'memory', ttl: 300000, compress: false, maxSize: 500 * 1024, validate: true, syncToBackend: false },
            'account-activity-data': { layer: 'backend', ttl: 60000, compress: false, dependencies: ['accounts-data', 'cash-flows-data', 'executions-data'] },
            'account-activity-*': { layer: 'backend', ttl: 60000, compress: false }
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
     * Get current version for a cache key
     * @param {string} key - Cache key
     * @returns {string} - Version string
     */
    getCurrentVersion(key) {
        // Simple version based on timestamp
        return Date.now().toString();
    }

    /**
     * Check if cached version is still valid
     * @param {string} key - Cache key
     * @param {string} version - Cached version
     * @returns {boolean} - True if valid
     */
    isVersionValid(key, version) {
        // For now, always valid - can be extended for cache busting
        return true;
    }

    /**
     * אתחול מערכת המטמון המאוחדת
     * @returns {Promise<boolean>} הצלחת האתחול
     */
    async initialize() {
        try {
            // window.Logger.info('🔄 Initializing Unified Cache Manager...', { page: "unified-cache-manager" });
            
            // אתחול IndexedDB
            if (window.indexedDB) {
                this.layers.indexedDB = new IndexedDBLayer();
                await this.layers.indexedDB.initialize();
            } else {
                window.Logger.warn('⚠️ IndexedDB not available, using localStorage fallback', { page: "unified-cache-manager" });
                this.layers.indexedDB = new LocalStorageLayer();
            }
            
            // אתחול שכבות אחרות
            await this.layers.memory.initialize();
            await this.layers.localStorage.initialize();
            await this.layers.backend.initialize();
            
            // טעינת סטטיסטיקות
            await this.updateStats();
            
            this.initialized = true;
            // window.Logger.info('✅ Unified Cache Manager initialized successfully', { page: "unified-cache-manager" });
            
            // הודעת הצלחה - מועברת להודעה סופית
            // if (window.notificationSystem) {
            //     window.notificationSystem.showNotification(
            //         'מערכת מטמון מאוחדת אותחלה בהצלחה',
            //         'success'
            //     );
            // }
            
            return true;
        } catch (error) {
            window.Logger.error('❌ Failed to initialize Unified Cache Manager:', error, { page: "unified-cache-manager" });
            
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
            window.Logger.warn('⚠️ Unified Cache Manager not initialized', { page: "unified-cache-manager" });
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
            
                // window.Logger.info(`✅ Saved ${key} to ${layer} layer (${responseTime.toFixed(2, { page: "unified-cache-manager" })}ms)`);
            return result;
            
        } catch (error) {
            window.Logger.error(`❌ Failed to save ${key}:`, error, { page: "unified-cache-manager" });
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
            window.Logger.warn('⚠️ Unified Cache Manager not initialized', { page: "unified-cache-manager" });
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
                        
                        // window.Logger.info(`✅ Retrieved ${key} from ${layer} layer (${responseTime.toFixed(2, { page: "unified-cache-manager" })}ms)`);
                        return data;
                    }
                }
            }
            
            // אם לא נמצא, נסה fallback
            if (options.fallback) {
                window.Logger.debug(`⚠️ Key ${key} not found, using fallback`, { page: "unified-cache-manager" });
                const fallbackData = await options.fallback();
                
                // שמור את הנתונים מהשירות למטמון
                if (fallbackData !== null) {
                    await this.save(key, fallbackData, options);
                }
                
                return fallbackData;
            }
            
            const responseTime = performance.now() - startTime;
            this.updatePerformanceStats(responseTime, false);
            
            window.Logger.debug(`❌ Key ${key} not found in any layer`, { page: "unified-cache-manager" });
            return null;
            
        } catch (error) {
            window.Logger.error(`❌ Failed to get ${key}:`, error, { page: "unified-cache-manager" });
            this.updatePerformanceStats(performance.now() - startTime, false);
            return options.fallback ? await options.fallback() : null;
        }
    }

    /**
     * Get multiple keys at once
     * @param {string[]} keys - Array of keys to retrieve
     * @returns {Promise<Object>} - Object with key-value pairs
     */
    async getMultiple(keys) {
        try {
            const results = {};
            
            for (const key of keys) {
                results[key] = await this.get(key);
            }
            
            window.Logger.debug('Multiple cache get', { 
                count: keys.length,
                page: 'unified-cache-manager'
            });
            
            return results;
        } catch (error) {
            window.Logger.error('Error getting multiple keys', error, { 
                count: keys.length,
                page: 'unified-cache-manager'
            });
            return {};
        }
    }

    /**
     * Set multiple keys at once
     * @param {Object} data - Object with key-value pairs
     * @param {string} ttl - TTL policy
     * @returns {Promise<number>} - Number of keys set
     */
    async setMultiple(data, ttl = 'medium') {
        try {
            let setCount = 0;
            
            for (const [key, value] of Object.entries(data)) {
                await this.save(key, value, { ttl });
                setCount++;
            }
            
            window.Logger.debug('Multiple cache set', { 
                count: setCount,
                page: 'unified-cache-manager'
            });
            
            return setCount;
        } catch (error) {
            window.Logger.error('Error setting multiple keys', error, { 
                count: Object.keys(data).length,
                page: 'unified-cache-manager'
            });
            return 0;
        }
    }

    /**
     * Check if key exists and is valid
     * @param {string} key - Cache key to check
     * @returns {Promise<boolean>} - True if exists and valid
     */
    async has(key) {
        try {
            const value = await this.get(key);
            return value !== null;
        } catch (error) {
            window.Logger.error('Error checking key existence', error, { 
                key,
                page: 'unified-cache-manager'
            });
            return false;
        }
    }

    /**
     * Get cache statistics
     * @returns {Object} - Statistics object
     */
    getStats() {
        try {
            const stats = {
                ...this.stats,
                layers: {
                    memory: {
                        entries: Object.keys(this.memoryCache).length,
                        size: JSON.stringify(this.memoryCache).length
                    },
                    localStorage: {
                        entries: Object.keys(localStorage).length,
                        size: new Blob([JSON.stringify(localStorage)]).size
                    },
                    indexedDB: this.stats.layers.indexedDB,
                    backend: this.stats.layers.backend
                },
                performance: {
                    avgResponseTime: this.responseTimes.length > 0 
                        ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
                        : 0,
                    hitRate: this.stats.operations.get > 0 
                        ? (this.hits / this.stats.operations.get * 100).toFixed(2) 
                        : 0,
                    missRate: this.stats.operations.get > 0 
                        ? ((this.stats.operations.get - this.hits) / this.stats.operations.get * 100).toFixed(2) 
                        : 0
                }
            };
            
            window.Logger.debug('Cache stats retrieved', { 
                stats,
                page: 'unified-cache-manager'
            });
            
            return stats;
        } catch (error) {
            window.Logger.error('Error getting cache stats', error, { 
                page: 'unified-cache-manager'
            });
            return this.stats;
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
            window.Logger.warn('⚠️ Unified Cache Manager not initialized', { page: "unified-cache-manager" });
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
                window.Logger.info(`✅ Removed ${key} from cache`, { page: "unified-cache-manager" });
            } else {
                window.Logger.debug(`⚠️ Key ${key} not found for removal`, { page: "unified-cache-manager" });
            }
            
            return removed;
            
        } catch (error) {
            window.Logger.error(`❌ Failed to remove ${key}:`, error, { page: "unified-cache-manager" });
            return false;
        }
    }

    /**
     * Invalidate cache by dependency chain
     * @param {string} changedKey - Key that changed
     * @returns {Promise<number>} - Number of keys invalidated
     */
    async invalidateByDependency(changedKey) {
        try {
            const toInvalidate = this.findDependentKeys(changedKey);
            
            for (const key of toInvalidate) {
                await this.remove(key);
                // Recursive invalidation
                await this.invalidateByDependency(key);
            }
            
            window.Logger.info('Cache invalidated by dependency', { 
                changedKey, 
                invalidated: toInvalidate.length,
                page: 'unified-cache-manager'
            });
            
            return toInvalidate.length;
        } catch (error) {
            window.Logger.error('Error invalidating by dependency', error, { 
                changedKey,
                page: 'unified-cache-manager'
            });
            return 0;
        }
    }

    /**
     * Find all keys that depend on the given key
     * @param {string} changedKey - Key that changed
     * @returns {string[]} - Array of dependent keys
     */
    findDependentKeys(changedKey) {
        const dependentKeys = [];
        
        for (const [key, dependencies] of Object.entries(CACHE_DEPENDENCIES)) {
            if (dependencies.includes(changedKey)) {
                dependentKeys.push(key);
            }
        }
        
        return dependentKeys;
    }

    /**
     * Clear cache by pattern (supports wildcards)
     * @param {string} pattern - Pattern to match (e.g., 'trades-*')
     * @returns {Promise<number>} - Number of keys cleared
     */
    async invalidate(pattern) {
        try {
            const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
            let clearedCount = 0;
            
            // Clear from all layers
            for (const [layerName, layer] of Object.entries(this.layers)) {
                if (!layer) continue;
                
                // Get all keys from this layer
                const keys = await this.getLayerKeys(layerName);
                
                // Match and remove
                for (const key of keys) {
                    if (regex.test(key)) {
                        await layer.remove(key);
                        clearedCount++;
                    }
                }
            }
            
            window.Logger.info('Cache cleared by pattern', { 
                pattern, 
                count: clearedCount,
                page: 'unified-cache-manager'
            });
            
            return clearedCount;
        } catch (error) {
            window.Logger.error('Error clearing by pattern', error, { 
                pattern,
                page: 'unified-cache-manager'
            });
            return 0;
        }
    }

    /**
     * Get all keys from a specific layer
     * @param {string} layerName - Layer name
     * @returns {Promise<string[]>} - Array of keys
     */
    async getLayerKeys(layerName) {
        const layer = this.layers[layerName];
        if (!layer) return [];
        
        try {
            switch (layerName) {
                case 'memory':
                    return Object.keys(this.memoryCache);
                case 'localStorage':
                    return Object.keys(localStorage);
                case 'indexedDB':
                    // Implementation depends on IndexedDB structure
                    return [];
                case 'backend':
                    // Would need API call
                    return [];
                default:
                    return [];
            }
        } catch (error) {
            return [];
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
            window.Logger.warn('⚠️ Unified Cache Manager not initialized', { page: "unified-cache-manager" });
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
                window.Logger.info(`✅ Cleared ${type} cache`, { page: "unified-cache-manager" });
                
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
            window.Logger.error(`❌ Failed to clear ${type} cache:`, error, { page: "unified-cache-manager" });
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
            window.Logger.warn('⚠️ Failed to compress data:', error, { page: "unified-cache-manager" });
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
            window.Logger.warn(`⚠️ Failed to sync ${key} to backend:`, error, { page: "unified-cache-manager" });
        }
    }

    /**
     * קבלת כל המפתחות מכל השכבות
     * @returns {Promise<Array<string>>} רשימת כל המפתחות
     */
    async getAllKeys() {
        const allKeys = new Set();
        
        try {
            // איסוף מפתחות מכל השכבות
            for (const [layerName, layer] of Object.entries(this.layers)) {
                if (layer && layer.getAllKeys) {
                    const layerKeys = await layer.getAllKeys();
                    layerKeys.forEach(key => allKeys.add(key));
                }
            }
            
            return Array.from(allKeys);
        } catch (error) {
            window.Logger.warn('⚠️ Error getting all keys:', error, { page: "unified-cache-manager" });
            return [];
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
            window.Logger.warn('⚠️ Failed to update layer stats:', error, { page: "unified-cache-manager" });
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
                // window.Logger.info('✅ Memory Layer initialized', { page: "unified-cache-manager" });
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
    
    async getAllKeys() {
        return Array.from(this.cache.keys());
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
                // window.Logger.info('✅ LocalStorage Layer initialized', { page: "unified-cache-manager" });
    }

    async save(key, data, policy) {
        try {
            const fullKey = this.prefix + key;
            const value = JSON.stringify(data);
            localStorage.setItem(fullKey, value);
            return true;
        } catch (error) {
            window.Logger.error('❌ LocalStorage save failed:', error, { page: "unified-cache-manager" });
            return false;
        }
    }

    async get(key, options) {
        try {
            const fullKey = this.prefix + key;
            const value = localStorage.getItem(fullKey);
            if (value === null || value === undefined) {
                return null;
            }
            // Handle "undefined" string that was stored incorrectly
            if (value === 'undefined' || value === 'null') {
                return null;
            }
            return JSON.parse(value);
        } catch (error) {
            window.Logger.error('❌ LocalStorage get failed:', error, { page: "unified-cache-manager" });
            return null;
        }
    }

    async remove(key, options) {
        try {
            const fullKey = this.prefix + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            window.Logger.error('❌ LocalStorage remove failed:', error, { page: "unified-cache-manager" });
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
            window.Logger.error('❌ LocalStorage clear failed:', error, { page: "unified-cache-manager" });
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
    
    async getAllKeys() {
        try {
            return Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
        } catch (error) {
            window.Logger.warn('⚠️ Error getting localStorage keys:', error, { page: "unified-cache-manager" });
            return [];
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
                    window.Logger.error('❌ IndexedDB open failed', { page: "unified-cache-manager" });
                    reject(request.error);
                };
                
                request.onsuccess = () => {
                    this.db = request.result;
                    // window.Logger.info('✅ IndexedDB Layer initialized', { page: "unified-cache-manager" });
                    resolve(true);
                };
                
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('unified-cache')) {
                        const store = db.createObjectStore('unified-cache', { keyPath: 'key' });
                        store.createIndex('timestamp', 'timestamp', { unique: false });
                        window.Logger.info('✅ IndexedDB object store created', { page: "unified-cache-manager" });
                    }
                };
            });
        }
        window.Logger.warn('⚠️ IndexedDB not available', { page: "unified-cache-manager" });
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
            window.Logger.error('❌ IndexedDB save failed:', error, { page: "unified-cache-manager" });
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
            window.Logger.error('❌ IndexedDB get failed:', error, { page: "unified-cache-manager" });
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
            window.Logger.error('❌ IndexedDB remove failed:', error, { page: "unified-cache-manager" });
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
            window.Logger.error('❌ IndexedDB clear failed:', error, { page: "unified-cache-manager" });
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
    
    async getAllKeys() {
        try {
            if (this.db) {
                const transaction = this.db.transaction(['unified-cache'], 'readonly');
                const store = transaction.objectStore('unified-cache');
                const request = store.getAllKeys();
                return new Promise((resolve, reject) => {
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });
            }
            return [];
        } catch (error) {
            window.Logger.warn('⚠️ Error getting IndexedDB keys:', error, { page: "unified-cache-manager" });
            return [];
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
                // window.Logger.info('✅ Backend Cache Layer initialized', { page: "unified-cache-manager" });
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
            window.Logger.error('❌ Backend Cache save failed:', error, { page: "unified-cache-manager" });
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
            window.Logger.error('❌ Backend Cache get failed:', error, { page: "unified-cache-manager" });
            return null;
        }
    }

    async remove(key, options) {
        try {
            return this.cache.delete(key);
        } catch (error) {
            window.Logger.error('❌ Backend Cache remove failed:', error, { page: "unified-cache-manager" });
            return false;
        }
    }

    async clear(options) {
        try {
            this.cache.clear();
            return true;
        } catch (error) {
            window.Logger.error('❌ Backend Cache clear failed:', error, { page: "unified-cache-manager" });
            return false;
        }
    }

    getStats() {
        return {
            entries: this.cache.size,
            size: 0 // לא ניתן לחשב בקליינט
        };
    }
    
    async getAllKeys() {
        return Array.from(this.cache.keys());
    }


    /**
     * Initialize IndexedDB
     */
    async initializeIndexedDB() {
        return new Promise((resolve, reject) => {
            try {
                const request = indexedDB.open('UnifiedCacheDB', 2);
                
                request.onerror = (event) => {
                    window.Logger.warn('⚠️ IndexedDB not available:', event.target.error, { page: "unified-cache-manager" });
                    resolve(); // Continue without IndexedDB
                };
                
                request.onupgradeneeded = (event) => {
                    try {
                        const db = event.target.result;
                        if (!db.objectStoreNames.contains('unified-cache')) {
                            db.createObjectStore('unified-cache', { keyPath: 'key' });
                        }
                    } catch (upgradeError) {
                        window.Logger.error('❌ Error during IndexedDB upgrade:', upgradeError, { page: "unified-cache-manager" });
                        reject(upgradeError);
                    }
                };
                
                request.onsuccess = () => {
                    try {
                        this.db = request.result;
                        window.Logger.info('✅ IndexedDB initialized', { page: "unified-cache-manager" });
                        resolve();
                    } catch (successError) {
                        window.Logger.error('❌ Error after IndexedDB success:', successError, { page: "unified-cache-manager" });
                        reject(successError);
                    }
                };
                
            } catch (error) {
                window.Logger.error('❌ Error opening IndexedDB:', error, { page: "unified-cache-manager" });
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
            window.Logger.warn('⚠️ Could not load from localStorage:', error.message || error, { page: "unified-cache-manager" });
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
            window.Logger.warn('⚠️ Error updating stats:', error, { page: "unified-cache-manager" });
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
            window.Logger.warn('⚠️ Error calculating average response time:', error, { page: "unified-cache-manager" });
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
            window.Logger.warn('⚠️ Error calculating hit rate:', error, { page: "unified-cache-manager" });
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
/**
 * Clear all cache layers
 * @function clearAllCache
 * @async
 * @param {Object} options - Options for clearing cache
 * @returns {Promise<void>}
 */
UnifiedCacheManager.prototype.clearAllCache = async function(options = {}) {
    try {
        window.Logger.info('🔄 Starting complete cache clearing process...', { page: "unified-cache-manager" });
        
        const clearedLayers = [];
        const errors = [];
        
        // Check if specific layers are requested
        const requestedLayers = options.layers || ['all'];
        
        // 1. Clear Unified Cache Manager (all layers or specific layers)
        try {
            if (requestedLayers.includes('all')) {
                await this.clear('all');
                clearedLayers.push('Unified Cache (all layers)');
            } else {
                // Clear specific layers
                for (const layer of requestedLayers) {
                    if (this.layers[layer] && this.layers[layer].clear) {
                        await this.layers[layer].clear(options);
                        clearedLayers.push(`Unified Cache (${layer} layer)`);
                    }
                }
            }
            window.Logger.info('✅ Unified Cache cleared successfully', { page: "unified-cache-manager" });
        } catch (error) {
            window.Logger.error('❌ Error clearing Unified Cache:', error, { page: "unified-cache-manager" });
            errors.push(`Unified Cache: ${error.message}`);
        }
        
        // 1.5. Clear Preferences Cache (PreferencesCore uses UnifiedCacheManager, so already cleared above)
        // PreferencesCore no longer has its own cacheManager - it uses UnifiedCacheManager directly
        // All preference cache keys are prefixed with 'preference_' and are already cleared in step 1
        // No need to clear PreferencesCore.cacheManager because it doesn't exist anymore
        try {
            // Just log that preferences cache is cleared via UnifiedCacheManager
            if (window.PreferencesCore) {
                clearedLayers.push('Preferences Cache (via UnifiedCacheManager)');
                window.Logger.info('✅ Preferences cache cleared via UnifiedCacheManager', { page: "unified-cache-manager" });
            }
        } catch (error) {
            window.Logger.error('❌ Error logging preferences cache clear:', error, { page: "unified-cache-manager" });
            // Don't add to errors - this is just logging
        }
        
        // 2. Clear localStorage (only our keys)
        try {
            const keys = Object.keys(localStorage);
            const ourKeys = keys.filter(key => {
                // UnifiedCacheManager keys (with prefix)
                if (key.startsWith('tiktrack_')) return true;
                
                // Preferences keys (without prefix)
                if (key.startsWith('preference_')) return true;
                if (key.startsWith('all_preferences_')) return true;
                if (key.startsWith('preference_group_')) return true;
                
                // Explicit patterns (with prefix)
                if (key.startsWith('tiktrack_preference_')) return true;
                if (key.startsWith('tiktrack_all_preferences_')) return true;
                if (key.startsWith('tiktrack_preference_group_')) return true;
                
                // User preferences - legacy keys
                if (key === 'user-preferences') return true;
                if (key === 'tiktrack_user-preferences') return true;
                if (key === 'tikTrack_preferences') return true; // Legacy fallback key
                if (key === 'tt:preferences') return true; // Cross-tab sync key
                
                // Orphan Keys - State Management
                if (key === 'cashFlowsSectionState') return true;
                if (key === 'executionsTopSectionCollapsed') return true;
                if (key.startsWith('sortState_')) return true;
                if (key.startsWith('section-visibility-')) return true;
                if (key.startsWith('top-section-collapsed-')) return true;
                
                // Orphan Keys - User Preferences
                if (key === 'colorScheme') return true;
                if (key === 'customColorScheme') return true;
                if (key === 'headerFilters') return true;
                if (key === 'consoleSettings') return true;
                
                // Orphan Keys - Testing/Debug
                if (key === 'crud_test_results') return true;
                if (key === 'linterLogs') return true;
                if (key === 'css-duplicates-results') return true;
                if (key === 'serverMonitorSettings') return true;
                
                return false;
            });
            
            ourKeys.forEach(key => localStorage.removeItem(key));
            clearedLayers.push(`localStorage (${ourKeys.length} keys)`);
            window.Logger.info(`✅ localStorage cleared successfully (${ourKeys.length} keys)`, { page: "unified-cache-manager" });
        } catch (error) {
            window.Logger.error('❌ Error clearing localStorage:', error, { page: "unified-cache-manager" });
            errors.push(`localStorage: ${error.message}`);
        }
        
        // 3. Clear sessionStorage (only our keys)
        try {
            const keys = Object.keys(sessionStorage);
            const ourKeys = keys.filter(key => {
                // UnifiedCacheManager keys (with prefix)
                if (key.startsWith('tiktrack_')) return true;
                
                // Preferences keys (without prefix)
                if (key.startsWith('preference_')) return true;
                if (key.startsWith('all_preferences_')) return true;
                if (key.startsWith('preference_group_')) return true;
                
                // Explicit patterns (with prefix)
                if (key.startsWith('tiktrack_preference_')) return true;
                if (key.startsWith('tiktrack_all_preferences_')) return true;
                if (key.startsWith('tiktrack_preference_group_')) return true;
                
                // User preferences - legacy keys
                if (key === 'user-preferences') return true;
                if (key === 'tiktrack_user-preferences') return true;
                if (key === 'tikTrack_preferences') return true; // Legacy fallback key
                if (key === 'tt:preferences') return true; // Cross-tab sync key
                
                // Orphan Keys - State Management
                if (key === 'cashFlowsSectionState') return true;
                if (key === 'executionsTopSectionCollapsed') return true;
                if (key.startsWith('sortState_')) return true;
                if (key.startsWith('section-visibility-')) return true;
                if (key.startsWith('top-section-collapsed-')) return true;
                
                // Orphan Keys - User Preferences
                if (key === 'colorScheme') return true;
                if (key === 'customColorScheme') return true;
                if (key === 'headerFilters') return true;
                if (key === 'consoleSettings') return true;
                
                // Orphan Keys - Testing/Debug
                if (key === 'crud_test_results') return true;
                if (key === 'linterLogs') return true;
                if (key === 'css-duplicates-results') return true;
                if (key === 'serverMonitorSettings') return true;
                
                return false;
            });
            
            ourKeys.forEach(key => sessionStorage.removeItem(key));
            clearedLayers.push(`sessionStorage (${ourKeys.length} keys)`);
            window.Logger.info(`✅ sessionStorage cleared successfully (${ourKeys.length} keys)`, { page: "unified-cache-manager" });
        } catch (error) {
            window.Logger.error('❌ Error clearing sessionStorage:', error, { page: "unified-cache-manager" });
            errors.push(`sessionStorage: ${error.message}`);
        }
        
        // 4. Clear IndexedDB CACHE ONLY (NOT HISTORICAL DATA)
        if ('indexedDB' in window) {
            try {
                // Only clear cache-related databases, NOT historical data
                const cacheOnlyDatabases = ['unified-cache', 'tiktrack-cache']; // Only cache databases
                const historicalDatabases = ['tiktrack-data', 'notifications-history', 'file-mappings', 'linter-results', 'js-analysis']; // Historical data - DO NOT DELETE
                
                window.Logger.info('🔄 Clearing IndexedDB cache only (preserving historical data, { page: "unified-cache-manager" })...');
                
                // Clear only cache databases
                for (const dbName of cacheOnlyDatabases) {
                    try {
                        await new Promise((resolve) => {
                            const openReq = indexedDB.open(dbName);
                            openReq.onsuccess = () => {
                                const db = openReq.result;
                                
                                // Check if database has any object stores
                                if (db.objectStoreNames.length === 0) {
                                    window.Logger.info(`ℹ️ Database ${dbName} has no object stores, skipping`, { page: "unified-cache-manager" });
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
                                        window.Logger.info(`✅ Cleared cache object store: ${dbName}.${storeName}`, { page: "unified-cache-manager" });
                                    };
                                    clearReq.onerror = () => {
                                        window.Logger.warn(`⚠️ Failed to clear cache object store: ${dbName}.${storeName}`, clearReq.error, { page: "unified-cache-manager" });
                                    };
                                }
                                
                                transaction.oncomplete = () => {
                                    db.close();
                                    resolve();
                                };
                                transaction.onerror = () => {
                                    window.Logger.warn(`⚠️ Transaction failed for cache database ${dbName}`, transaction.error, { page: "unified-cache-manager" });
                                    db.close();
                                    resolve();
                                };
                            };
                            openReq.onerror = () => {
                                window.Logger.warn(`⚠️ Could not open cache database: ${dbName}`, openReq.error, { page: "unified-cache-manager" });
                                resolve();
                            };
                        });
                    } catch (error) {
                        window.Logger.warn(`⚠️ Error clearing cache data from ${dbName}:`, error, { page: "unified-cache-manager" });
                    }
                }
                
                // Log preserved historical databases
                window.Logger.info(`✅ Preserved historical data in IndexedDB: ${historicalDatabases.join(', ', { page: "unified-cache-manager" })}`);
                
                clearedLayers.push('IndexedDB Cache (historical data preserved)');
            } catch (error) {
                window.Logger.error('❌ Error clearing IndexedDB cache:', error, { page: "unified-cache-manager" });
                errors.push(`IndexedDB Cache: ${error.message}`);
            }
        }
        
        // 5. Clear Service Worker (if exists)
        if ('serviceWorker' in navigator) {
            try {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                    window.Logger.info('✅ Service Worker unregistered', { page: "unified-cache-manager" });
                }
                if (registrations.length > 0) {
                    clearedLayers.push(`Service Worker (${registrations.length} registrations)`);
                }
            } catch (error) {
                window.Logger.warn('⚠️ Error unregistering Service Worker:', error, { page: "unified-cache-manager" });
                errors.push(`Service Worker: ${error.message}`);
            }
        }
        
        // 5.5. Clear Cache API (Browser Cache)
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
                if (cacheNames.length > 0) {
                    clearedLayers.push(`Cache API (${cacheNames.length} caches)`);
                }
                window.Logger.info('✅ Cache API cleared successfully', { page: "unified-cache-manager" });
            } catch (error) {
                window.Logger.error('❌ Error clearing Cache API:', error, { page: "unified-cache-manager" });
                errors.push(`Cache API: ${error.message}`);
            }
        }
        
        // 6. Clear specific cache keys and global variables
        const cacheKeys = [
            'user-preferences', 'ui-state', 'filter-state', 'notifications-history',
            'file-mappings', 'linter-results', 'js-analysis', 'market-data',
            'trade-data', 'dashboard-data', 'tikTrack_preferences'
        ];
        
        try {
            cacheKeys.forEach(key => {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
            });
            clearedLayers.push('Specific Cache Keys');
            window.Logger.info('✅ Specific cache keys cleared successfully', { page: "unified-cache-manager" });
        } catch (error) {
            window.Logger.error('❌ Error clearing specific cache keys:', error, { page: "unified-cache-manager" });
            errors.push(`Cache Keys: ${error.message}`);
        }
        
        // 6.5. Clear Window Variables (page data objects)
        try {
            const windowVars = [
                'tradePlansData', 'tradePlansLoaded',
                'trading_accountsData', 'allTradingAccountsData',
                'trading_accountsLoaded', 'currenciesData', 'currenciesLoaded',
                'colorPreferencesLoaded', 'alertsData', 'alertsLoaded',
                'tradesData', 'tradesLoaded', 'tickersData', 'tickersLoaded',
                'executionsData', 'executionsLoaded', 'notesData', 'notesLoaded',
                'cashFlowsData', 'cashFlowsLoaded', 'researchData', 'researchLoaded'
            ];
            
            let clearedCount = 0;
            windowVars.forEach(varName => {
                if (window.hasOwnProperty(varName)) {
                    delete window[varName];
                    clearedCount++;
                }
            });
            
            if (clearedCount > 0) {
                clearedLayers.push(`Window Variables (${clearedCount} variables)`);
                window.Logger.info(`✅ Window variables cleared successfully (${clearedCount} variables)`, { page: "unified-cache-manager" });
            }
        } catch (error) {
            window.Logger.warn('⚠️ Error clearing window variables:', error, { page: "unified-cache-manager" });
        }
        
        // 6.6. Clear global preference variables
        try {
            window.__latestPrefs = null;
            window.currentPreferences = null;
            clearedLayers.push('Global Preference Variables');
            window.Logger.info('✅ Global preference variables cleared successfully', { page: "unified-cache-manager" });
        } catch (error) {
            window.Logger.warn('⚠️ Error clearing global variables:', error, { page: "unified-cache-manager" });
        }
        
        // 6.7. Clear Service Caches
        try {
            const servicesToClear = [
                'EntityDetailsAPI', 'entityDetailsAPI', 'ExternalDataService', 
                'externalDataService', 'YahooFinanceService', 'yahooFinanceService',
                'TradesAdapter', 'LinterAdapter', 'PerformanceAdapter',
                'AccountService', 'accountService', 'TickerService', 'tickerService'
            ];
            
            const clearedServices = [];
            servicesToClear.forEach(serviceName => {
                const service = window[serviceName];
                if (service && service.cache && typeof service.cache.clear === 'function') {
                    service.cache.clear();
                    clearedServices.push(serviceName);
                }
                // Special case: YahooFinanceService has loadingPromises too
                if ((serviceName === 'YahooFinanceService' || serviceName === 'yahooFinanceService') && 
                    service?.loadingPromises?.clear) {
                    service.loadingPromises.clear();
                }
            });
            
            // Dynamic scan for any remaining cache objects
            for (const key in window) {
                if (window[key] && 
                    typeof window[key] === 'object' && 
                    window[key].cache instanceof Map) {
                    window[key].cache.clear();
                    if (!clearedServices.includes(key)) {
                        clearedServices.push(key);
                    }
                }
            }
            
            if (clearedServices.length > 0) {
                clearedLayers.push(`Service Caches (${clearedServices.length} services)`);
                window.Logger.info(`✅ Service caches cleared: ${clearedServices.join(', ')}`, { page: "unified-cache-manager" });
            }
        } catch (error) {
            window.Logger.warn('⚠️ Error clearing service caches:', error, { page: "unified-cache-manager" });
        }
        
        // 6.8. Clear Preferences Cache Objects
        try {
            const preferencesObjects = [
                'PreferenceValidator', 'PreferencesUI', 
                'PreferencesLazyLoader', 'PreferencesColors', 'PreferencesCore'
            ];
            
            const clearedObjects = [];
            preferencesObjects.forEach(objName => {
                const obj = window[objName];
                if (obj) {
                    // Clear all Map and Set properties
                    Object.keys(obj).forEach(key => {
                        try {
                            const value = obj[key];
                            if (value instanceof Map || value instanceof Set) {
                                value.clear();
                                clearedObjects.push(`${objName}.${key}`);
                            }
                        } catch (e) {
                            // Skip if property is not accessible
                        }
                    });
                }
            });
            
            // Also check PreferencesCore instance
            if (window.PreferencesCore) {
                ['existenceCache', 'validators', 'timestamps', 'constraints'].forEach(prop => {
                    if (window.PreferencesCore.validationManager && 
                        window.PreferencesCore.validationManager[prop]?.clear) {
                        window.PreferencesCore.validationManager[prop].clear();
                        clearedObjects.push(`PreferencesCore.validationManager.${prop}`);
                    }
                });
            }
            
            if (clearedObjects.length > 0) {
                clearedLayers.push(`Preferences Cache Objects (${clearedObjects.length} objects)`);
                window.Logger.info(`✅ Preferences cache objects cleared: ${clearedObjects.length} objects`, { page: "unified-cache-manager" });
            }
        } catch (error) {
            window.Logger.warn('⚠️ Error clearing preferences cache objects:', error, { page: "unified-cache-manager" });
        }
        
        // 6.9. Clear CSS Management Cache
        try {
            let cssCleared = false;
            if (typeof mergedDuplicates !== 'undefined' && mergedDuplicates?.clear) {
                mergedDuplicates.clear();
                cssCleared = true;
            }
            if (typeof removedDuplicates !== 'undefined' && removedDuplicates?.clear) {
                removedDuplicates.clear();
                cssCleared = true;
            }
            
            if (cssCleared) {
                clearedLayers.push('CSS Management Cache');
                window.Logger.info('✅ CSS Management cache cleared successfully', { page: "unified-cache-manager" });
            }
        } catch (error) {
            window.Logger.warn('⚠️ Error clearing CSS management cache:', error, { page: "unified-cache-manager" });
        }
        
        // 6.10. Clear Dynamic Window Variables (catch-all for any remaining data variables)
        try {
            const dynamicPatterns = [
                /Data$/,           // e.g., alertsData, tradesData
                /Loaded$/,        // e.g., alertsLoaded, tradesLoaded
                /Cache$/,         // e.g., preferencesCache
                /State$/,          // e.g., uiState, formState
                /Config$/,        // e.g., modalConfig
                /ModalConfig$/    // e.g., tradePlansModalConfig
            ];
            
            let dynamicCleared = 0;
            for (const key in window) {
                // Skip standard window properties and functions
                if (key.startsWith('webkit') || key.startsWith('moz') || 
                    key.startsWith('ms') || key === 'console' || 
                    key === 'localStorage' || key === 'sessionStorage' ||
                    key === 'indexedDB' || key === 'document' || key === 'navigator' ||
                    typeof window[key] === 'function' || key.startsWith('on') ||
                    key === 'location' || key === 'history' || key === 'screen') {
                    continue;
                }
                
                // Check if variable matches data patterns
                const matchesPattern = dynamicPatterns.some(pattern => pattern.test(key));
                if (matchesPattern && window.hasOwnProperty(key)) {
                    try {
                        delete window[key];
                        dynamicCleared++;
                    } catch (e) {
                        // Skip if cannot delete (e.g., read-only property)
                    }
                }
            }
            
            if (dynamicCleared > 0) {
                clearedLayers.push(`Dynamic Window Variables (${dynamicCleared} variables)`);
                window.Logger.info(`✅ Dynamic window variables cleared successfully (${dynamicCleared} variables)`, { page: "unified-cache-manager" });
            }
        } catch (error) {
            window.Logger.warn('⚠️ Error clearing dynamic window variables:', error, { page: "unified-cache-manager" });
        }
        
        // 6.11. Clear Cookies (if any TikTrack cookies exist)
        try {
            if (document.cookie) {
                const cookies = document.cookie.split(';');
                let cookiesCleared = 0;
                cookies.forEach(cookie => {
                    const cookieName = cookie.split('=')[0].trim();
                    // Only clear cookies that look like TikTrack cookies
                    if (cookieName.toLowerCase().includes('tiktrack') || 
                        cookieName.toLowerCase().includes('tt_') ||
                        cookieName.toLowerCase().includes('cache')) {
                        // Clear cookie by setting expiration to past
                        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
                        cookiesCleared++;
                    }
                });
                
                if (cookiesCleared > 0) {
                    clearedLayers.push(`Cookies (${cookiesCleared} cookies)`);
                    window.Logger.info(`✅ Cookies cleared successfully (${cookiesCleared} cookies)`, { page: "unified-cache-manager" });
                }
            }
        } catch (error) {
            window.Logger.warn('⚠️ Error clearing cookies:', error, { page: "unified-cache-manager" });
        }
        
        // 6.12. Clear DOM Cache (data attributes that might be used as cache)
        try {
            // Clear any data-cache attributes on elements
            const elementsWithCache = document.querySelectorAll('[data-cache], [data-cached]');
            let domCacheCleared = 0;
            elementsWithCache.forEach(el => {
                el.removeAttribute('data-cache');
                el.removeAttribute('data-cached');
                domCacheCleared++;
            });
            
            if (domCacheCleared > 0) {
                clearedLayers.push(`DOM Cache (${domCacheCleared} elements)`);
                window.Logger.info(`✅ DOM cache attributes cleared successfully (${domCacheCleared} elements)`, { page: "unified-cache-manager" });
            }
        } catch (error) {
            window.Logger.warn('⚠️ Error clearing DOM cache:', error, { page: "unified-cache-manager" });
        }
        
        // 7. Garbage Collection
        if (window.gc && typeof window.gc === 'function') {
            try {
                window.gc();
                clearedLayers.push('Garbage Collection');
                window.Logger.info('✅ Garbage Collection executed successfully', { page: "unified-cache-manager" });
            } catch (error) {
                window.Logger.warn('⚠️ Garbage Collection failed:', error, { page: "unified-cache-manager" });
            }
        }
        
        // 8. Clear notification cache
        if (window.notificationCache && typeof window.notificationCache.clear === 'function') {
            try {
                window.notificationCache.clear();
                clearedLayers.push('Notification Cache');
                window.Logger.info('✅ Notification Cache cleared successfully', { page: "unified-cache-manager" });
            } catch (error) {
                window.Logger.warn('⚠️ Notification Cache clear failed:', error, { page: "unified-cache-manager" });
            }
        }
        
        // 9. Clear preferences cache
        if (window.preferencesCache && typeof window.preferencesCache.clear === 'function') {
            try {
                await window.preferencesCache.clear();
                clearedLayers.push('Preferences Cache');
                window.Logger.info('✅ Preferences Cache cleared successfully', { page: "unified-cache-manager" });
            } catch (error) {
                window.Logger.warn('⚠️ Preferences Cache clear failed:', error, { page: "unified-cache-manager" });
            }
        }
        
        // 10. Clear Backend Cache (Server-side cache)
        try {
            window.Logger.info('🔄 Clearing backend server cache...', { page: "unified-cache-manager" });
            const response = await fetch('/api/cache/clear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                clearedLayers.push(`Backend Cache (${result.data?.preferences_cache || 'cleared'})`);
                window.Logger.info('✅ Backend cache cleared successfully', { page: "unified-cache-manager" });
            } else {
                throw new Error(`Backend cache clear failed: ${response.status}`);
            }
        } catch (error) {
            window.Logger.warn('⚠️ Failed to clear backend cache:', error, { page: "unified-cache-manager" });
            errors.push(`Backend Cache: ${error.message}`);
        }
        
        // 11. Refresh data from backend database
        try {
            window.Logger.info('🔄 Refreshing data from backend database...', { page: "unified-cache-manager" });
            await this.refreshDataFromBackend();
            clearedLayers.push('Data Refresh from Backend');
            window.Logger.info('✅ Data refreshed from backend successfully', { page: "unified-cache-manager" });
        } catch (error) {
            window.Logger.warn('⚠️ Failed to refresh data from backend:', error, { page: "unified-cache-manager" });
            errors.push(`Data Refresh: ${error.message}`);
        }
        
        // Update stats after clearing
        await this.updateStats();
        
        window.Logger.info('✅ Complete cache clearing process finished', { page: "unified-cache-manager" });
        return { success: true, clearedLayers, errors };
        
    } catch (error) {
        window.Logger.error('❌ Complete cache clearing process failed:', error, { page: "unified-cache-manager" });
        return { success: false, error: error.message };
    }
};

/**
 * Quick cache clearing for development - simple notification and auto-refresh
 * @param {Object} options - Options for clearing
 * @returns {Promise<Object>} Result with success status
 */
/**
 * Clear all cache quickly with auto-refresh
 * @function clearAllCacheQuick
 * @async
 * @param {Object} options - Options for clearing cache
 * @returns {Promise<void>}
 */
UnifiedCacheManager.prototype.clearAllCacheQuick = async function(options = {}) {
    try {
        window.Logger.info('🧹 Quick cache clearing for development...', { page: "unified-cache-manager" });
        
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
            
            // Auto-refresh after 1.5 seconds with confirmation dialog
            if (options.autoRefresh !== false) {
                console.log('🔄 clearAllCacheQuick: Setting up auto-refresh in 1.5 seconds...');
                setTimeout(() => {
                    console.log('🔄 clearAllCacheQuick: Showing confirmation dialog before reload...');
                    
                    // Show confirmation dialog before reload
                    if (typeof window.showConfirmationDialog === 'function') {
                        window.showConfirmationDialog(
                            'טעינה מחדש של העמוד',
                            'המטמון נוקה בהצלחה. האם להמשיך לטעינה מחדש של העמוד?',
                            () => {
                                console.log('✅ User confirmed page reload - executing now...');
                                window.location.reload(true);
                            },
                            () => {
                                console.log('❌ User cancelled page reload - staying on current page');
                            },
                            'success'
                        );
                    } else {
                        // Fallback to simple confirm
                        if (confirm('המטמון נוקה בהצלחה. האם להמשיך לטעינה מחדש של העמוד?')) {
                            console.log('✅ User confirmed page reload - executing now...');
                            window.location.reload(true);
                        } else {
                            console.log('❌ User cancelled page reload - staying on current page');
                        }
                    }
                }, 1500);
            } else {
                console.log('ℹ️ clearAllCacheQuick: autoRefresh disabled, skipping page reload');
            }
            
            window.Logger.info('✅ Quick cache clearing completed - auto-refresh in 1.5 seconds', { page: "unified-cache-manager" });
        }
        
        return result;
        
    } catch (error) {
        window.Logger.error('❌ Quick cache clearing failed:', error, { page: "unified-cache-manager" });
        
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
/**
 * Clear all cache with detailed logging
 * @function clearAllCacheDetailed
 * @async
 * @param {Object} options - Options for clearing cache
 * @returns {Promise<void>}
 */
UnifiedCacheManager.prototype.clearAllCacheDetailed = async function(options = {}) {
    try {
        window.Logger.info('🔄 Starting detailed cache clearing process...', { page: "unified-cache-manager" });
        
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
        window.Logger.error('❌ Detailed cache clearing failed:', error, { page: "unified-cache-manager" });
        
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
/**
 * Verify cache system functionality
 * @function verifyCacheSystem
 * @async
 * @param {Object} options - Options for verification
 * @returns {Promise<void>}
 */
UnifiedCacheManager.prototype.verifyCacheSystem = async function(options = {}) {
    try {
        window.Logger.info('🔍 Starting complete cache verification process...', { page: "unified-cache-manager" });
        
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
        window.Logger.info('📊 Phase 1: Scanning cache layers before clearing...', { page: "unified-cache-manager" });
        report.phases.preScan = await this.scanAllCacheLayers();
        report.summary.totalKeysBefore = this.countTotalKeys(report.phases.preScan);
        
        // Phase 2: Clear all cache
        window.Logger.info('🧹 Phase 2: Clearing all cache layers...', { page: "unified-cache-manager" });
        const clearResult = await this.clearAllCache(options);
        report.phases.clearing = clearResult;
        
        // Phase 3: Post-clearing scan
        window.Logger.info('📊 Phase 3: Scanning cache layers after clearing...', { page: "unified-cache-manager" });
        report.phases.postScan = await this.scanAllCacheLayers();
        report.summary.totalKeysAfter = this.countTotalKeys(report.phases.postScan);
        report.summary.clearedKeys = report.summary.totalKeysBefore - report.summary.totalKeysAfter;
        
        // Phase 4: Verification and test data insertion
        window.Logger.info('✅ Phase 4: Verifying cache system functionality...', { page: "unified-cache-manager" });
        report.phases.verification = await this.verifyCacheFunctionality();
        report.summary.verificationPassed = report.phases.verification.success;
        
        // Update stats
        await this.updateStats();
        
        window.Logger.info('✅ Complete cache verification process finished', { page: "unified-cache-manager" });
        return report;
        
    } catch (error) {
        window.Logger.error('❌ Cache verification process failed:', error, { page: "unified-cache-manager" });
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
/**
 * Scan all cache layers
 * @function scanAllCacheLayers
 * @async
 * @returns {Promise<Object>} Scan results
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
                    window.Logger.warn(`⚠️ Error checking IndexedDB cache ${dbName}:`, error, { page: "unified-cache-manager" });
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
                    window.Logger.warn(`⚠️ Error checking IndexedDB historical ${dbName}:`, error, { page: "unified-cache-manager" });
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
                window.Logger.warn('⚠️ Error scanning browser cache:', error, { page: "unified-cache-manager" });
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
        window.Logger.error('❌ Error during cache scan:', error, { page: "unified-cache-manager" });
    }
    
    return scanResults;
};

/**
 * Count total keys across all layers
 * @param {Object} scanResults - Results from scanAllCacheLayers
 * @returns {number} Total key count
 */
/**
 * Count total keys in scan results
 * @function countTotalKeys
 * @param {Object} scanResults - Scan results object
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
/**
 * Verify cache functionality by testing read/write operations
 * @function verifyCacheFunctionality
 * @async
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
        window.Logger.error('❌ Cache functionality verification failed:', error, { page: "unified-cache-manager" });
    }
    
    return testResults;
};

/**
 * Refresh data from backend database for all systems
 * @returns {Promise<Object>} Refresh results
 */
/**
 * Refresh data from backend
 * @function refreshDataFromBackend
 * @async
 * @returns {Promise<void>}
 */
UnifiedCacheManager.prototype.refreshDataFromBackend = async function() {
    const refreshResults = {
        success: true,
        refreshedSystems: [],
        errors: []
    };
    
    try {
        window.Logger.info('🔄 Starting data refresh from backend database...', { page: "unified-cache-manager" });
        
        // 1. Refresh trading data
        try {
            await this.refreshTradingData();
            refreshResults.refreshedSystems.push('Trading Data');
            window.Logger.info('✅ Trading data refreshed', { page: "unified-cache-manager" });
        } catch (error) {
            window.Logger.warn('⚠️ Failed to refresh trading data:', error, { page: "unified-cache-manager" });
            refreshResults.errors.push(`Trading Data: ${error.message}`);
        }
        
        // 2. Refresh market data
        try {
            await this.refreshMarketData();
            refreshResults.refreshedSystems.push('Market Data');
            window.Logger.info('✅ Market data refreshed', { page: "unified-cache-manager" });
        } catch (error) {
            window.Logger.warn('⚠️ Failed to refresh market data:', error, { page: "unified-cache-manager" });
            refreshResults.errors.push(`Market Data: ${error.message}`);
        }
        
        // 3. Refresh user preferences
        try {
            await this.refreshUserPreferences();
            refreshResults.refreshedSystems.push('User Preferences');
            window.Logger.info('✅ User preferences refreshed', { page: "unified-cache-manager" });
        } catch (error) {
            window.Logger.warn('⚠️ Failed to refresh user preferences:', error, { page: "unified-cache-manager" });
            refreshResults.errors.push(`User Preferences: ${error.message}`);
        }
        
        // 4. Refresh UI state
        try {
            await this.refreshUIState();
            refreshResults.refreshedSystems.push('UI State');
            window.Logger.info('✅ UI state refreshed', { page: "unified-cache-manager" });
        } catch (error) {
            window.Logger.warn('⚠️ Failed to refresh UI state:', error, { page: "unified-cache-manager" });
            refreshResults.errors.push(`UI State: ${error.message}`);
        }
        
        // 5. Refresh notifications
        try {
            await this.refreshNotifications();
            refreshResults.refreshedSystems.push('Notifications');
            window.Logger.info('✅ Notifications refreshed', { page: "unified-cache-manager" });
        } catch (error) {
            window.Logger.warn('⚠️ Failed to refresh notifications:', error, { page: "unified-cache-manager" });
            refreshResults.errors.push(`Notifications: ${error.message}`);
        }
        
        if (refreshResults.errors.length > 0) {
            refreshResults.success = false;
        }
        
        window.Logger.info('✅ Data refresh from backend completed', { page: "unified-cache-manager" });
        return refreshResults;
        
    } catch (error) {
        window.Logger.error('❌ Data refresh from backend failed:', error, { page: "unified-cache-manager" });
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
/**
 * Refresh trading data
 * @function refreshTradingData
 * @async
 * @returns {Promise<void>}
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
        window.Logger.warn('⚠️ Error refreshing trading data:', error, { page: "unified-cache-manager" });
        throw error;
    }
};

/**
 * Refresh market data from backend
 */
/**
 * Refresh market data
 * @function refreshMarketData
 * @async
 * @returns {Promise<void>}
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
        window.Logger.warn('⚠️ Error refreshing market data:', error, { page: "unified-cache-manager" });
        throw error;
    }
};

/**
 * Get policy for key, supporting wildcards
 * @param {string} key - Cache key
 * @returns {object} Policy configuration
 */
/**
 * Get key policy for cache layer decision
 * @function getKeyPolicy
 * @param {string} key - Cache key
 * @returns {Object} Key policy
 */
UnifiedCacheManager.prototype.getKeyPolicy = function(key) {
    // Exact match
    if (this.defaultPolicies[key]) {
        return this.defaultPolicies[key];
    }
    
    // Pattern matching
    for (const [pattern, policy] of Object.entries(this.defaultPolicies)) {
        if (pattern.includes('*')) {
            const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
            if (regex.test(key)) {
                return policy;
            }
        }
    }
    
    // Default fallback
    return { layer: 'localStorage', ttl: 3600000, compress: false };
};

/**
 * Refresh user preferences from backend
 */
/**
 * Refresh user preferences
 * @function refreshUserPreferences
 * @async
 * @returns {Promise<void>}
 */
UnifiedCacheManager.prototype.refreshUserPreferences = async function(targetProfileId = null, groupName = null) {
    console.log('🔍 DEBUG: refreshUserPreferences() called with targetProfileId:', targetProfileId, 'groupName:', groupName);
    
    try {
        // Clear all preferences cache keys OR specific group keys
        // NOTE: getAllKeys() returns keys WITH prefix (e.g., 'tiktrack_preference_...')
        // But we also need to check localStorage directly for keys without prefix
        console.log('🔍 DEBUG: Getting all keys from UnifiedCacheManager...');
        const keys = await this.getAllKeys();
        console.log('🔍 DEBUG: getAllKeys() returned:', keys.length, 'keys');
        console.log('🔍 DEBUG: Sample keys from UnifiedCacheManager:', keys.slice(0, 5));
        
        console.log('🔍 DEBUG: Getting keys directly from localStorage...');
        const localStorageKeys = Object.keys(localStorage);
        console.log('🔍 DEBUG: localStorage has', localStorageKeys.length, 'total keys');
        
        const prefKeys = [];
        
        // If groupName is specified, only clear that group's cache
        if (groupName) {
            const groupPattern = `preference_group_${groupName}_`;
            console.log(`🔍 DEBUG: Filtering for specific group: ${groupPattern}`);
            
            // Add keys from UnifiedCacheManager (with prefix)
            keys.forEach(key => {
                if (key.includes(groupPattern)) {
                    prefKeys.push(key);
                }
            });
            
            // Add keys directly from localStorage (without prefix)
            localStorageKeys.forEach(key => {
                if (key.includes(groupPattern)) {
                    prefKeys.push(key);
                }
            });
            
            console.log('🔍 DEBUG: Found', prefKeys.length, `keys for group ${groupName}`);
        } else {
            // Clear all preferences cache keys
            console.log('🔍 DEBUG: Filtering ALL preference keys...');
            
            // Add keys from UnifiedCacheManager (with prefix)
            keys.forEach(key => {
                if (key.startsWith('tiktrack_preference_') || 
                    key.startsWith('tiktrack_all_preferences_') ||
                    key.startsWith('tiktrack_preference_group_') ||
                    key === 'tiktrack_user-preferences') {
                    prefKeys.push(key);
                }
            });
            console.log('🔍 DEBUG: Found', prefKeys.length, 'keys from UnifiedCacheManager');
            
            // Add keys directly from localStorage (without prefix)
            localStorageKeys.forEach(key => {
                if (key.startsWith('preference_') || 
                    key.startsWith('all_preferences_') ||
                    key.startsWith('preference_group_') ||
                    key === 'user-preferences') {
                    prefKeys.push(key);
                }
            });
            console.log('🔍 DEBUG: Total preference keys to remove:', prefKeys.length);
        }
        
        window.Logger.info(`🔄 Refreshing user preferences${groupName ? ` for group ${groupName}` : ''} - clearing ${prefKeys.length} keys`, { page: "unified-cache-manager" });
        if (prefKeys.length > 0) {
            window.Logger.info(`🔍 Preference keys found:`, prefKeys.slice(0, 10), { page: "unified-cache-manager" });
        }
        
        let removedCount = 0;
        for (const key of prefKeys) {
            try {
                console.log(`🗑️ DEBUG: Processing key: ${key}`);
                
                // Remove directly from localStorage (simplest and most reliable)
                if (localStorage.getItem(key) !== null) {
                    localStorage.removeItem(key);
                    removedCount++;
                    console.log(`✅ DEBUG: Removed ${key} from localStorage directly`);
                    window.Logger.debug(`🗑️ Removed ${key} from localStorage`, { page: "unified-cache-manager" });
                } else {
                    console.log(`⚠️ DEBUG: Key ${key} not found in localStorage (already removed?)`);
                }
                
                // Also try removing via UnifiedCacheManager (which will try all layers)
                // This handles the key both with and without prefix
                if (key.startsWith('tiktrack_')) {
                    // Key has prefix, remove without prefix for UnifiedCacheManager
                    const keyWithoutPrefix = key.replace('tiktrack_', '');
                    console.log(`🗑️ DEBUG: Trying UnifiedCacheManager.remove("${keyWithoutPrefix}")`);
                    await this.remove(keyWithoutPrefix);
                } else {
                    // Key without prefix
                    console.log(`🗑️ DEBUG: Trying UnifiedCacheManager.remove("${key}")`);
                    await this.remove(key);
                }
            } catch (removeError) {
                console.error(`❌ DEBUG: Failed to remove key ${key}:`, removeError);
                window.Logger.warn(`⚠️ Failed to remove key ${key}:`, removeError, { page: "unified-cache-manager" });
            }
        }
        
        console.log(`✅ DEBUG: Successfully removed ${removedCount} keys from localStorage`);
        
        // NOTE: We do NOT reload preferences here anymore
        // The caller (PreferencesUI.saveAllPreferences) should handle reloading the form
        // This prevents double-loading and rate limiting issues
        
        console.log('✅ DEBUG: Cache cleared successfully - preferences will be reloaded by caller');
        
    } catch (error) {
        console.error('❌ DEBUG: Error in refreshUserPreferences:', error);
        window.Logger.warn('⚠️ Error refreshing user preferences:', error, { page: "unified-cache-manager" });
        throw error;
    }
};

/**
 * Refresh UI state from backend
 */
/**
 * Refresh UI state
 * @function refreshUIState
 * @async
 * @returns {Promise<void>}
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
        window.Logger.warn('⚠️ Error refreshing UI state:', error, { page: "unified-cache-manager" });
        throw error;
    }
};

/**
 * Refresh notifications from backend
 */
/**
 * Refresh notifications
 * @function refreshNotifications
 * @async
 * @returns {Promise<void>}
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
        window.Logger.warn('⚠️ Error refreshing notifications:', error, { page: "unified-cache-manager" });
        throw error;
    }
};

// ===== GLOBAL FUNCTION EXPORTS =====

// Export functions to global scope for backward compatibility
/**
 * Clear all unified cache (global wrapper)
 * @function clearAllUnifiedCache
 * @async
 * @param {Object} options - Options for clearing cache
 * @returns {Promise<void>}
 */
window.clearAllUnifiedCache = async function(options = {}) {
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
        return await window.UnifiedCacheManager.clearAllCacheDetailed(options);
    } else {
        window.Logger.warn('⚠️ UnifiedCacheManager not initialized', { page: "unified-cache-manager" });
        return { success: false, error: 'UnifiedCacheManager not initialized' };
    }
};

/**
 * Clear all unified cache quickly (global wrapper)
 * @function clearAllUnifiedCacheQuick
 * @async
 * @param {Object} options - Options for clearing cache
 * @returns {Promise<void>}
 */
window.clearAllUnifiedCacheQuick = async function(options = {}) {
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
        return await window.UnifiedCacheManager.clearAllCacheQuick(options);
    } else {
        window.Logger.warn('⚠️ UnifiedCacheManager not initialized', { page: "unified-cache-manager" });
        return { success: false, error: 'UnifiedCacheManager not initialized' };
    }
};

// Alias for compatibility with existing code
/**
 * Clear all cache (global wrapper)
 * @function clearAllCache
 * @async
 * @param {Object} options - Options for clearing cache
 * @returns {Promise<void>}
 */
window.clearAllCache = async function(options = {}) {
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
        return await window.UnifiedCacheManager.clearAllCacheDetailed(options);
    } else {
        window.Logger.warn('⚠️ UnifiedCacheManager not initialized', { page: "unified-cache-manager" });
        return { success: false, error: 'UnifiedCacheManager not initialized' };
    }
};

/**
 * Verify cache system (global wrapper)
 * @function verifyCacheSystem
 * @async
 * @param {Object} options - Options for verification
 * @returns {Promise<void>}
 */
window.verifyCacheSystem = async function(options = {}) {
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
        return await window.UnifiedCacheManager.verifyCacheSystem(options);
    } else {
        window.Logger.warn('⚠️ UnifiedCacheManager not initialized', { page: "unified-cache-manager" });
        return { success: false, error: 'UnifiedCacheManager not initialized' };
    }
};

// ===== SMART CACHE CLEARING FUNCTIONS FOR HEADER BUTTONS =====
// These functions provide convenient wrappers for the existing cache clearing methods

/**
 * ניקוי מהיר לצרכי פיתוח - כפתור ראשי
 * Uses existing clearAllCacheQuick() method
 */
/**
 * Clear cache quickly (global wrapper)
 * @function clearCacheQuick
 * @async
 * @param {Event} event - Event object
 * @returns {Promise<void>}
 */
window.clearCacheQuick = async function(event, options = {}) {
    if (event) {
        event.preventDefault();
    }
    
    window.Logger.info('🧹 clearCacheQuick called - ניקוי מהיר לצרכי פיתוח...', { page: "unified-cache-manager" });
    console.log('🔄 clearCacheQuick: Starting cache clearing process...');
    console.log('🔄 clearCacheQuick: Options:', options);
    
    try {
        if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
            console.log('✅ clearCacheQuick: UnifiedCacheManager is initialized, calling clearAllCacheQuick...');
            await window.UnifiedCacheManager.clearAllCacheQuick(options);
        } else {
            window.Logger.warn('⚠️ UnifiedCacheManager לא זמין', { page: "unified-cache-manager" });
        }
    } catch (error) {
        window.Logger.error('❌ שגיאה בניקוי מהיר:', error, { page: "unified-cache-manager" });
    }
};

/**
 * ניקוי שכבה ספציפית - תפריט משנה
 * Uses existing clearAllCache() method with layer filter
 * @param {string} layer - שם השכבה (memory, localStorage, indexedDB, backend)
 */
/**
 * Clear specific cache layer (global wrapper)
 * @function clearCacheLayer
 * @async
 * @param {string} layer - Cache layer to clear
 * @param {Event} event - Event object
 * @returns {Promise<void>}
 */
window.clearCacheLayer = async function(layer, event) {
    if (event) {
        event.preventDefault();
    }
    
    window.Logger.info(`🗂️ ניקוי שכבה: ${layer}...`, { page: "unified-cache-manager" });
    
    try {
        if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
            await window.UnifiedCacheManager.clearAllCache({ layers: [layer] });
        } else {
            window.Logger.warn('⚠️ UnifiedCacheManager לא זמין', { page: "unified-cache-manager" });
        }
    } catch (error) {
        window.Logger.error(`❌ שגיאה בניקוי ${layer}:`, error, { page: "unified-cache-manager" });
    }
};

/**
 * ניקוי כל שכבות המטמון (ללא רענון) - תפריט משנה
 * Uses existing clearAllCacheDetailed() method
 */
/**
 * Clear all cache advanced (global wrapper)
 * @function clearAllCacheAdvanced
 * @async
 * @param {Event} event - Event object
 * @returns {Promise<void>}
 */
window.clearAllCacheAdvanced = async function(event) {
    if (event) {
        event.preventDefault();
    }
    
    window.Logger.info('🧠 ניקוי כל שכבות המטמון...', { page: "unified-cache-manager" });
    
    try {
        if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
            await window.UnifiedCacheManager.clearAllCacheDetailed();
        } else {
            window.Logger.warn('⚠️ UnifiedCacheManager לא זמין', { page: "unified-cache-manager" });
        }
    } catch (error) {
        window.Logger.error('❌ שגיאה בניקוי מלא:', error, { page: "unified-cache-manager" });
    }
};

/**
 * ניקוי מלא + רענון עמוד - תפריט משנה
 * Uses existing clearAllCacheDetailed() method + page reload
 */
/**
 * Clear cache full (global wrapper)
 * @function clearCacheFull
 * @async
 * @param {Event} event - Event object
 * @returns {Promise<void>}
 */
window.clearCacheFull = async function(event) {
    if (event) {
        event.preventDefault();
    }
    
    window.Logger.info('🔄 ניקוי מלא + רענון עמוד...', { page: "unified-cache-manager" });
    
    try {
        if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
            await window.UnifiedCacheManager.clearAllCacheDetailed();
        } else {
            window.Logger.warn('⚠️ UnifiedCacheManager לא זמין', { page: "unified-cache-manager" });
        }
        
        // ריענון אוטומטי אחרי 1.5 שניות
        setTimeout(() => {
            window.location.reload();
        }, 1500);
        
    } catch (error) {
        window.Logger.error('❌ שגיאה בניקוי מלא:', error, { page: "unified-cache-manager" });
    }
};

/**
 * REMOVED: clearCacheBeforeCRUD
 * ==========================================
 * This function was removed as it caused issues with the CRUD refresh flow.
 * CRUDResponseHandler now handles all cache management automatically.
 * 
 * If cache clearing is needed, use CRUDResponseHandler's built-in mechanisms
 * instead of this function.
 * 
 * Date removed: January 2025
 * Reason: Simplified cache management flow
 */

// ===== NEW SIMPLIFIED CACHE CLEARING FUNCTIONS FOR DEVELOPMENT =====
// Simplified functions for the new cache architecture (localStorage only)

/**
 * Clear UI state for development (sorting, filters, etc.)
 * @function clearUIState
 * @param {Event} event - Event object
 */
window.clearUIState = async function(event) {
    if (event) event.preventDefault();
    
    try {
        window.Logger.info('🧹 Clearing UI state only...', { page: "unified-cache-manager" });
        
        const keys = Object.keys(localStorage);
        let cleared = 0;
        
        keys.forEach(key => {
            if (key.startsWith('ui_state_') || key.startsWith('filter_') || key.startsWith('sort_')) {
                localStorage.removeItem(key);
                cleared++;
            }
        });
        
        const message = `נקו ${cleared} פריטי העדפות UI`;
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('ניקוי UI', message);
        }
        
        window.Logger.info(`✅ Cleared ${cleared} UI state items`, { page: "unified-cache-manager" });
    } catch (error) {
        window.Logger.error('❌ Error clearing UI state:', error, { page: "unified-cache-manager" });
    }
};

/**
 * Clear all localStorage for development testing
 * @function clearAllCacheForDevelopment
 * @param {Event} event - Event object
 */
window.clearAllCacheForDevelopment = async function(event) {
    if (event) event.preventDefault();
    
    try {
        window.Logger.info('🧹 Clearing all localStorage...', { page: "unified-cache-manager" });
        
        const itemCount = localStorage.length;
        localStorage.clear();
        sessionStorage.clear();
        
        const message = `נוקה כל ה-localStorage (${itemCount} פריטים)`;
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('ניקוי מטמון', message);
        }
        
        window.Logger.info(`✅ Cleared ${itemCount} localStorage items`, { page: "unified-cache-manager" });
    } catch (error) {
        window.Logger.error('❌ Error clearing localStorage:', error, { page: "unified-cache-manager" });
    }
};

/**
 * Hard reload of the page for development
 * @function hardReload
 * @param {Event} event - Event object
 */
window.hardReload = function(event) {
    if (event) event.preventDefault();
    
    window.Logger.info('🔄 Performing hard reload...', { page: "unified-cache-manager" });
    
    // Hard reload - bypass cache
    if (typeof window.location !== 'undefined') {
        window.location.reload(true);
    } else {
        window.location.href = window.location.href;
    }
};

/**
 * Main cache clearing function for development (wrapper)
 * @function clearCacheForDevelopment
 * @param {Event} event - Event object
 */
window.clearCacheForDevelopment = async function(event) {
    if (event) event.preventDefault();
    
    try {
        // Clear localStorage
        await window.clearAllCacheForDevelopment(event);
        
        // Show notification
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification(
                'ניקוי מטמון לפיתוח',
                'המטמון נוקה. רענון עמוד בעוד 2 שניות...'
            );
        }
        
        // Auto-reload after 2 seconds
        setTimeout(() => {
            window.hardReload(event);
        }, 2000);
        
    } catch (error) {
        window.Logger.error('❌ Error in clearCacheForDevelopment:', error, { page: "unified-cache-manager" });
    }
};

// window.Logger.info('📦 Unified Cache Manager loaded', { page: "unified-cache-manager" });

// Auto-initialize the cache manager immediately
(async () => {
    if (window.UnifiedCacheManager && !window.UnifiedCacheManager.initialized) {
        try {
            await window.UnifiedCacheManager.initialize();
            window.Logger.info('✅ Unified Cache Manager auto-initialized successfully', { page: "unified-cache-manager" });
        } catch (error) {
            window.Logger.warn('⚠️ Failed to auto-initialize Unified Cache Manager:', error, { page: "unified-cache-manager" });
        }
    }
})();

// Export additional functions to window for easy access
/**
 * Invalidate cache by dependency (global wrapper)
 * @function invalidateByDependency
 * @param {string} changedKey - Changed key
 * @returns {Promise<number>} Number of invalidated keys
 */
window.invalidateByDependency = function(changedKey) {
    if (!window.unifiedCacheManager) {
        window.Logger.error('Cache Manager not initialized', { changedKey, page: 'unified-cache-manager' });
        return Promise.resolve(0);
    }
    return window.unifiedCacheManager.invalidateByDependency(changedKey);
};

/**
 * Invalidate cache by pattern (global wrapper)
 * @function invalidateCache
 * @param {string} pattern - Cache pattern
 * @returns {Promise<number>} Number of invalidated keys
 */
window.invalidateCache = function(pattern) {
    if (!window.unifiedCacheManager) {
        window.Logger.error('Cache Manager not initialized', { pattern, page: 'unified-cache-manager' });
        return Promise.resolve(0);
    }
    return window.unifiedCacheManager.invalidate(pattern);
};

/**
 * Get multiple cache values (global wrapper)
 * @function getMultipleCache
 * @param {Array<string>} keys - Cache keys
 * @returns {Promise<Object>} Cache values
 */
window.getMultipleCache = function(keys) {
    if (!window.unifiedCacheManager) {
        window.Logger.error('Cache Manager not initialized', { count: keys.length, page: 'unified-cache-manager' });
        return Promise.resolve({});
    }
    return window.unifiedCacheManager.getMultiple(keys);
};

/**
 * Set multiple cache values (global wrapper)
 * @function setMultipleCache
 * @param {Object} data - Data to cache
 * @param {string} ttl - Time to live
 * @returns {Promise<void>}
 */
window.setMultipleCache = function(data, ttl = 'medium') {
    if (!window.unifiedCacheManager) {
        window.Logger.error('Cache Manager not initialized', { count: Object.keys(data).length, page: 'unified-cache-manager' });
        return Promise.resolve(0);
    }
    return window.unifiedCacheManager.setMultiple(data, ttl);
};

/**
 * Check if cache has key (global wrapper)
 * @function hasCache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Whether key exists
 */
window.hasCache = function(key) {
    if (!window.unifiedCacheManager) {
        window.Logger.error('Cache Manager not initialized', { key, page: 'unified-cache-manager' });
        return Promise.resolve(false);
    }
    return window.unifiedCacheManager.has(key);
};

/**
 * Get cache statistics (global wrapper)
 * @function getCacheStats
 * @returns {Promise<Object>} Cache statistics
 */
window.getCacheStats = function() {
    if (!window.unifiedCacheManager) {
        window.Logger.error('Cache Manager not initialized', { page: 'unified-cache-manager' });
        return {};
    }
    return window.unifiedCacheManager.getStats();
};
