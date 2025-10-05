/**
 * ========================================
 * Memory Optimizer - TikTrack
 * ========================================
 * 
 * אופטימיזטור זיכרון אוטומטי עם cleanup, compression ו-pagination
 * 
 * תכונות:
 * - cleanup אוטומטי של נתונים ישנים
 * - compression לנתונים גדולים
 * - pagination לנתונים גדולים
 * - lazy loading לנתונים לא קריטיים
 * 
 * מחבר: TikTrack Development Team
 * תאריך יצירה: 26 בינואר 2025
 * גרסה: 1.0.0
 * ========================================
 */

class MemoryOptimizer {
    constructor() {
        this.initialized = false;
        this.cleanupInterval = null;
        this.cleanupIntervalMs = 300000; // 5 דקות
        this.compressionThreshold = 1024 * 1024; // 1MB
        this.paginationThreshold = 1000; // 1000 פריטים
        this.maxMemoryUsage = 50 * 1024 * 1024; // 50MB
        
        // סטטיסטיקות אופטימיזציה
        this.stats = {
            operations: {
                cleanup: 0,
                compress: 0,
                decompress: 0,
                paginate: 0,
                lazyLoad: 0
            },
            memory: {
                beforeCleanup: 0,
                afterCleanup: 0,
                saved: 0
            },
            compression: {
                beforeSize: 0,
                afterSize: 0,
                ratio: 0
            },
            pagination: {
                pagesCreated: 0,
                itemsPerPage: 0
            }
        };
        
        // הגדרות אופטימיזציה
        this.settings = {
            autoCleanup: true,
            autoCompression: true,
            autoPagination: true,
            lazyLoading: true,
            compressionLevel: 'medium', // low, medium, high
            pageSize: 100,
            maxAge: 86400000 // 24 שעות
        };
        
        // Cache של נתונים דחוסים
        this.compressionCache = new Map();
        
        // Cache של נתונים מפולגים
        this.paginationCache = new Map();
    }

    /**
     * אתחול מערכת האופטימיזציה
     * @returns {Promise<boolean>} הצלחת האתחול
     */
    async initialize() {
        try {
            console.log('🔄 Initializing Memory Optimizer...');
            
            // טעינת הגדרות מ-localStorage
            await this.loadSettings();
            
            // התחלת cleanup אוטומטי
            if (this.settings.autoCleanup) {
                this.startAutoCleanup();
            }
            
            // בדיקת שימוש בזיכרון
            await this.checkMemoryUsage();
            
            this.initialized = true;
            console.log('✅ Memory Optimizer initialized successfully');
            
            // הודעת הצלחה
            if (window.notificationSystem) {
                window.notificationSystem.showNotification(
                    'מערכת אופטימיזציה זיכרון אותחלה בהצלחה',
                    'success'
                );
            }
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Memory Optimizer:', error);
            
            // הודעת שגיאה
            if (window.notificationSystem) {
                window.notificationSystem.showNotification(
                    'שגיאה באתחול מערכת אופטימיזציה זיכרון',
                    'error'
                );
            }
            
            return false;
        }
    }

    /**
     * ניקוי נתונים ישנים
     * @param {string} type - סוג המטמון
     * @param {Object} options - אפשרויות נוספות
     * @returns {Promise<boolean>} הצלחת הניקוי
     */
    async cleanup(type, options = {}) {
        if (!this.initialized) {
            console.warn('⚠️ Memory Optimizer not initialized');
            return false;
        }

        const startTime = performance.now();
        
        try {
            this.stats.operations.cleanup++;
            
            let cleanedItems = 0;
            let savedMemory = 0;
            
            // ניקוי לפי סוג
            switch (type) {
                case 'memory':
                    ({ cleanedItems, savedMemory } = await this.cleanupMemory(options));
                    break;
                case 'localStorage':
                    ({ cleanedItems, savedMemory } = await this.cleanupLocalStorage(options));
                    break;
                case 'indexedDB':
                    ({ cleanedItems, savedMemory } = await this.cleanupIndexedDB(options));
                    break;
                case 'all':
                    ({ cleanedItems, savedMemory } = await this.cleanupAll(options));
                    break;
                default:
                    console.warn(`⚠️ Unknown cleanup type: ${type}`);
                    return false;
            }
            
            // עדכון סטטיסטיקות
            this.stats.memory.saved += savedMemory;
            
            const responseTime = performance.now() - startTime;
            
            console.log(`✅ Cleanup completed: ${cleanedItems} items, ${this.formatBytes(savedMemory)} saved (${responseTime.toFixed(2)}ms)`);
            
            // הודעת הצלחה
            if (window.notificationSystem && cleanedItems > 0) {
                window.notificationSystem.showNotification(
                    `נוקו ${cleanedItems} פריטים ישנים, נחסכו ${this.formatBytes(savedMemory)}`,
                    'success'
                );
            }
            
            return true;
            
        } catch (error) {
            console.error(`❌ Cleanup failed for ${type}:`, error);
            return false;
        }
    }

    /**
     * דחיסת נתונים
     * @param {any} data - הנתונים לדחיסה
     * @param {Object} options - אפשרויות נוספות
     * @returns {any} הנתונים הדחוסים
     */
    compress(data, options = {}) {
        if (!this.initialized) {
            console.warn('⚠️ Memory Optimizer not initialized');
            return data;
        }

        try {
            this.stats.operations.compress++;
            
            const originalSize = this.calculateDataSize(data);
            
            // בדיקה אם הנתונים גדולים מספיק לדחיסה
            if (originalSize < this.compressionThreshold && !options.force) {
                return data;
            }
            
            let compressedData;
            
            // בחירת שיטת דחיסה לפי רמה
            switch (this.settings.compressionLevel) {
                case 'low':
                    compressedData = this.compressLow(data);
                    break;
                case 'medium':
                    compressedData = this.compressMedium(data);
                    break;
                case 'high':
                    compressedData = this.compressHigh(data);
                    break;
                default:
                    compressedData = this.compressMedium(data);
            }
            
            const compressedSize = this.calculateDataSize(compressedData);
            const ratio = (1 - compressedSize / originalSize) * 100;
            
            // עדכון סטטיסטיקות
            this.stats.compression.beforeSize += originalSize;
            this.stats.compression.afterSize += compressedSize;
            this.stats.compression.ratio = this.stats.compression.beforeSize > 0 ? 
                (1 - this.stats.compression.afterSize / this.stats.compression.beforeSize) * 100 : 0;
            
            console.log(`✅ Compressed data: ${this.formatBytes(originalSize)} → ${this.formatBytes(compressedSize)} (${ratio.toFixed(1)}% reduction)`);
            
            return compressedData;
            
        } catch (error) {
            console.error('❌ Compression failed:', error);
            return data;
        }
    }

    /**
     * פענוח נתונים דחוסים
     * @param {any} data - הנתונים הדחוסים
     * @param {Object} options - אפשרויות נוספות
     * @returns {any} הנתונים המפוענחים
     */
    decompress(data, options = {}) {
        if (!this.initialized) {
            console.warn('⚠️ Memory Optimizer not initialized');
            return data;
        }

        try {
            this.stats.operations.decompress++;
            
            // בדיקה אם הנתונים דחוסים
            if (!this.isCompressed(data)) {
                return data;
            }
            
            let decompressedData;
            
            // פענוח לפי סוג דחיסה
            if (data._compressionType) {
                switch (data._compressionType) {
                    case 'low':
                        decompressedData = this.decompressLow(data);
                        break;
                    case 'medium':
                        decompressedData = this.decompressMedium(data);
                        break;
                    case 'high':
                        decompressedData = this.decompressHigh(data);
                        break;
                    default:
                        decompressedData = data;
                }
            } else {
                // נסיון פענוח אוטומטי
                decompressedData = this.decompressAuto(data);
            }
            
            console.log(`✅ Decompressed data`);
            return decompressedData;
            
        } catch (error) {
            console.error('❌ Decompression failed:', error);
            return data;
        }
    }

    /**
     * חלוקת נתונים לעמודים
     * @param {Array} data - הנתונים לחלוקה
     * @param {number} pageSize - גודל עמוד
     * @param {number} page - מספר עמוד
     * @returns {Object} נתונים מפולגים
     */
    paginate(data, pageSize = null, page = 0) {
        if (!this.initialized) {
            console.warn('⚠️ Memory Optimizer not initialized');
            return { data, page, totalPages: 1, totalItems: data.length };
        }

        try {
            this.stats.operations.paginate++;
            
            if (!Array.isArray(data)) {
                return { data, page, totalPages: 1, totalItems: 1 };
            }
            
            const actualPageSize = pageSize || this.settings.pageSize;
            const totalItems = data.length;
            const totalPages = Math.ceil(totalItems / actualPageSize);
            
            // בדיקה אם חלוקה לעמודים נדרשת
            if (totalItems <= this.paginationThreshold && !pageSize) {
                return { data, page, totalPages: 1, totalItems };
            }
            
            const startIndex = page * actualPageSize;
            const endIndex = Math.min(startIndex + actualPageSize, totalItems);
            const pageData = data.slice(startIndex, endIndex);
            
            // עדכון סטטיסטיקות
            this.stats.pagination.pagesCreated += totalPages;
            this.stats.pagination.itemsPerPage = actualPageSize;
            
            const result = {
                data: pageData,
                page,
                totalPages,
                totalItems,
                pageSize: actualPageSize,
                hasNextPage: page < totalPages - 1,
                hasPrevPage: page > 0
            };
            
            console.log(`✅ Paginated data: ${totalItems} items → ${totalPages} pages (${pageData.length} items on page ${page + 1})`);
            
            return result;
            
        } catch (error) {
            console.error('❌ Pagination failed:', error);
            return { data, page, totalPages: 1, totalItems: data.length };
        }
    }

    /**
     * טעינה עצלה של נתונים
     * @param {string} key - מפתח הנתונים
     * @param {Function} loader - פונקציית טעינה
     * @param {Object} options - אפשרויות נוספות
     * @returns {Promise<any>} הנתונים
     */
    async lazyLoad(key, loader, options = {}) {
        if (!this.initialized) {
            console.warn('⚠️ Memory Optimizer not initialized');
            return await loader();
        }

        try {
            this.stats.operations.lazyLoad++;
            
            // בדיקה אם הנתונים כבר נטענו
            if (this.paginationCache.has(key)) {
                const cached = this.paginationCache.get(key);
                if (Date.now() - cached.timestamp < (options.ttl || 300000)) { // 5 דקות ברירת מחדל
                    console.log(`✅ Lazy loaded ${key} from cache`);
                    return cached.data;
                }
            }
            
            // טעינת נתונים
            const data = await loader();
            
            // שמירה ב-cache
            this.paginationCache.set(key, {
                data,
                timestamp: Date.now()
            });
            
            console.log(`✅ Lazy loaded ${key} from source`);
            return data;
            
        } catch (error) {
            console.error(`❌ Lazy load failed for ${key}:`, error);
            return null;
        }
    }

    /**
     * קבלת סטטיסטיקות אופטימיזציה
     * @returns {Object} סטטיסטיקות מפורטות
     */
    getStats() {
        return {
            initialized: this.initialized,
            settings: this.settings,
            stats: {
                ...this.stats,
                memoryUsage: this.getMemoryUsage(),
                compressionRatio: this.stats.compression.ratio,
                averagePageSize: this.stats.pagination.itemsPerPage
            }
        };
    }

    /**
     * ניקוי Memory Layer
     * @param {Object} options - אפשרויות נוספות
     * @returns {Object} תוצאות הניקוי
     */
    async cleanupMemory(options) {
        let cleanedItems = 0;
        let savedMemory = 0;
        
        if (window.UnifiedCacheManager && window.UnifiedCacheManager.layers.memory) {
            const memoryLayer = window.UnifiedCacheManager.layers.memory;
            const beforeSize = memoryLayer.cache.size;
            
            // ניקוי פריטים ישנים
            for (const [key, value] of memoryLayer.cache.entries()) {
                if (this.isOldData(value, options.maxAge || this.settings.maxAge)) {
                    memoryLayer.cache.delete(key);
                    cleanedItems++;
                }
            }
            
            const afterSize = memoryLayer.cache.size;
            savedMemory = (beforeSize - afterSize) * 1024; // הערכה גסה
        }
        
        return { cleanedItems, savedMemory };
    }

    /**
     * ניקוי LocalStorage Layer
     * @param {Object} options - אפשרויות נוספות
     * @returns {Object} תוצאות הניקוי
     */
    async cleanupLocalStorage(options) {
        let cleanedItems = 0;
        let savedMemory = 0;
        
        try {
            const keys = Object.keys(localStorage);
            const prefix = 'tiktrack_';
            
            for (const key of keys) {
                if (key.startsWith(prefix)) {
                    let value = null;
                    if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                        value = await window.UnifiedCacheManager.get(key);
                    } else {
                        value = localStorage.getItem(key); // fallback
                    }
                    
                    if (value) {
                        const data = typeof value === 'string' ? JSON.parse(value) : value;
                        
                        if (this.isOldData(data, options.maxAge || this.settings.maxAge)) {
                            if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                                await window.UnifiedCacheManager.remove(key, { layer: 'localStorage' });
                            } else {
                                localStorage.removeItem(key); // fallback
                            }
                            cleanedItems++;
                            savedMemory += typeof value === 'string' ? value.length : JSON.stringify(value).length;
                    }
                }
            }
        } catch (error) {
            console.error('❌ LocalStorage cleanup failed:', error);
        }
        
        return { cleanedItems, savedMemory };
    }

    /**
     * ניקוי IndexedDB Layer
     * @param {Object} options - אפשרויות נוספות
     * @returns {Object} תוצאות הניקוי
     */
    async cleanupIndexedDB(options) {
        let cleanedItems = 0;
        let savedMemory = 0;
        
        try {
            if (window.UnifiedCacheManager) {
                // ניקוי נתונים ישנים ממערכת המטמון המאוחדת
                await window.UnifiedCacheManager.cleanup();
                console.log('🧹 Unified cache cleanup completed');
            }
        } catch (error) {
            console.error('❌ IndexedDB cleanup failed:', error);
        }
        
        return { cleanedItems, savedMemory };
    }

    /**
     * ניקוי כל השכבות
     * @param {Object} options - אפשרויות נוספות
     * @returns {Object} תוצאות הניקוי
     */
    async cleanupAll(options) {
        const memoryResult = await this.cleanupMemory(options);
        const localStorageResult = await this.cleanupLocalStorage(options);
        const indexedDBResult = await this.cleanupIndexedDB(options);
        
        return {
            cleanedItems: memoryResult.cleanedItems + localStorageResult.cleanedItems + indexedDBResult.cleanedItems,
            savedMemory: memoryResult.savedMemory + localStorageResult.savedMemory + indexedDBResult.savedMemory
        };
    }

    /**
     * דחיסה ברמה נמוכה
     * @param {any} data - הנתונים
     * @returns {any} הנתונים הדחוסים
     */
    compressLow(data) {
        try {
            const jsonString = JSON.stringify(data);
            return {
                _compressed: jsonString.replace(/\s+/g, ' ').trim(),
                _compressionType: 'low'
            };
        } catch (error) {
            return data;
        }
    }

    /**
     * דחיסה ברמה בינונית
     * @param {any} data - הנתונים
     * @returns {any} הנתונים הדחוסים
     */
    compressMedium(data) {
        try {
            const jsonString = JSON.stringify(data);
            // הסרת רווחים מיותרים + הסרת null/undefined
            let compressed = jsonString.replace(/\s+/g, ' ').trim();
            compressed = compressed.replace(/null/g, '');
            compressed = compressed.replace(/undefined/g, '');
            return {
                _compressed: compressed,
                _compressionType: 'medium'
            };
        } catch (error) {
            return data;
        }
    }

    /**
     * דחיסה ברמה גבוהה
     * @param {any} data - הנתונים
     * @returns {any} הנתונים הדחוסים
     */
    compressHigh(data) {
        try {
            // דחיסה מתקדמת - הסרת properties מיותרות
            const compressed = this.removeUnnecessaryProperties(data);
            const jsonString = JSON.stringify(compressed);
            return {
                _compressed: jsonString.replace(/\s+/g, '').trim(),
                _compressionType: 'high'
            };
        } catch (error) {
            return data;
        }
    }

    /**
     * פענוח ברמה נמוכה
     * @param {any} data - הנתונים הדחוסים
     * @returns {any} הנתונים המפוענחים
     */
    decompressLow(data) {
        try {
            return JSON.parse(data._compressed);
        } catch (error) {
            return data;
        }
    }

    /**
     * פענוח ברמה בינונית
     * @param {any} data - הנתונים הדחוסים
     * @returns {any} הנתונים המפוענחים
     */
    decompressMedium(data) {
        try {
            return JSON.parse(data._compressed);
        } catch (error) {
            return data;
        }
    }

    /**
     * פענוח ברמה גבוהה
     * @param {any} data - הנתונים הדחוסים
     * @returns {any} הנתונים המפוענחים
     */
    decompressHigh(data) {
        try {
            return JSON.parse(data._compressed);
        } catch (error) {
            return data;
        }
    }

    /**
     * פענוח אוטומטי
     * @param {any} data - הנתונים הדחוסים
     * @returns {any} הנתונים המפוענחים
     */
    decompressAuto(data) {
        try {
            if (data._compressed) {
                return JSON.parse(data._compressed);
            }
            return data;
        } catch (error) {
            return data;
        }
    }

    /**
     * הסרת properties מיותרות
     * @param {any} data - הנתונים
     * @returns {any} הנתונים המעודכנים
     */
    removeUnnecessaryProperties(data) {
        if (Array.isArray(data)) {
            return data.map(item => this.removeUnnecessaryProperties(item));
        }
        
        if (typeof data === 'object' && data !== null) {
            const cleaned = {};
            for (const [key, value] of Object.entries(data)) {
                // שמירת properties חשובות בלבד
                if (!key.startsWith('_') && value !== null && value !== undefined) {
                    cleaned[key] = this.removeUnnecessaryProperties(value);
                }
            }
            return cleaned;
        }
        
        return data;
    }

    /**
     * בדיקה אם נתונים ישנים
     * @param {any} data - הנתונים
     * @param {number} maxAge - גיל מקסימלי במילישניות
     * @returns {boolean} האם ישנים
     */
    isOldData(data, maxAge) {
        if (data && data._cacheMeta && data._cacheMeta.timestamp) {
            return Date.now() - data._cacheMeta.timestamp > maxAge;
        }
        
        if (typeof data === 'object' && data.timestamp) {
            return Date.now() - data.timestamp > maxAge;
        }
        
        return false;
    }

    /**
     * בדיקה אם נתונים דחוסים
     * @param {any} data - הנתונים
     * @returns {boolean} האם דחוסים
     */
    isCompressed(data) {
        return data && typeof data === 'object' && data._compressed;
    }

    /**
     * התחלת ניקוי אוטומטי
     */
    startAutoCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        
        this.cleanupInterval = setInterval(async () => {
            await this.cleanup('all');
            await this.checkMemoryUsage();
        }, this.cleanupIntervalMs);
        
        console.log('🔄 Auto cleanup started');
    }

    /**
     * עצירת ניקוי אוטומטי
     */
    stopAutoCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
            console.log('⏹️ Auto cleanup stopped');
        }
    }

    /**
     * בדיקת שימוש בזיכרון
     */
    async checkMemoryUsage() {
        try {
            const usage = this.getMemoryUsage();
            
            if (usage > this.maxMemoryUsage) {
                console.warn(`⚠️ High memory usage: ${this.formatBytes(usage)}`);
                
                // ניקוי אוטומטי
                await this.cleanup('all');
                
                // הודעת אזהרה
                if (window.notificationSystem) {
                    window.notificationSystem.showNotification(
                        `שימוש גבוה בזיכרון: ${this.formatBytes(usage)}`,
                        'warning'
                    );
                }
            }
        } catch (error) {
            console.error('❌ Memory usage check failed:', error);
        }
    }

    /**
     * קבלת שימוש בזיכרון
     * @returns {number} שימוש בזיכרון בבייטים
     */
    getMemoryUsage() {
        try {
            // הערכה גסה של שימוש בזיכרון
            let usage = 0;
            
            // LocalStorage (fallback estimation)
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                usage += key.length + value.length;
            }
            
            // Memory cache
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.layers.memory) {
                usage += window.UnifiedCacheManager.layers.memory.cache.size * 1024;
            }
            
            return usage;
        } catch (error) {
            return 0;
        }
    }

    /**
     * טעינת הגדרות
     */
    async loadSettings() {
        try {
            let settings = null;
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                settings = await window.UnifiedCacheManager.get('tiktrack_memory_optimizer_settings');
            } else {
                settings = localStorage.getItem('tiktrack_memory_optimizer_settings'); // fallback
            }
            
            if (settings) {
                const parsedSettings = typeof settings === 'string' ? JSON.parse(settings) : settings;
                this.settings = { ...this.settings, ...parsedSettings };
            }
        } catch (error) {
            console.warn('⚠️ Failed to load settings:', error);
        }
    }

    /**
     * שמירת הגדרות
     */
    async saveSettings() {
        try {
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                await window.UnifiedCacheManager.save('tiktrack_memory_optimizer_settings', this.settings, {
                    layer: 'localStorage',
                    ttl: null, // persistent
                    syncToBackend: false
                });
            } else {
                localStorage.setItem('tiktrack_memory_optimizer_settings', JSON.stringify(this.settings)); // fallback
            }
        } catch (error) {
            console.warn('⚠️ Failed to save settings:', error);
        }
    }

    /**
     * עיצוב גודל בבתים
     * @param {number} bytes - גודל בבתים
     * @returns {string} גודל מעוצב
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
}

// יצירת instance גלובלי
window.MemoryOptimizer = new MemoryOptimizer();

// הוספה למערכת האתחול המאוחדת
if (window.UnifiedInitializationSystem) {
    window.UnifiedInitializationSystem.addCoreSystem('MemoryOptimizer', () => {
        return window.MemoryOptimizer.initialize();
    });
}

console.log('🚀 Memory Optimizer loaded');
