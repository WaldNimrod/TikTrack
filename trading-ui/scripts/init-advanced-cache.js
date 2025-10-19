/**
 * Advanced Initialization Cache System
 * 
 * This system provides advanced caching capabilities for the Smart Initialization System.
 * It implements multiple caching strategies to optimize script loading, reduce network requests,
 * and improve initialization performance.
 * 
 * Features:
 * - Multi-layer caching (Memory, localStorage, IndexedDB, Service Worker)
 * - Intelligent cache invalidation
 * - Cache preloading and warming
 * - Cache compression and optimization
 * - Cache analytics and monitoring
 * 
 * @version 1.0.0
 * @author TikTrack Development Team
 */

(function() {
    'use strict';

    class InitAdvancedCache {
        constructor() {
            this.cacheLayers = {
                memory: new Map(),
                localStorage: 'init-cache-',
                indexedDB: 'InitCacheDB',
                serviceWorker: 'init-cache-v1'
            };
            
            this.cacheConfig = {
                maxMemorySize: 10 * 1024 * 1024, // 10MB
                maxLocalStorageSize: 5 * 1024 * 1024, // 5MB
                maxIndexedDBSize: 50 * 1024 * 1024, // 50MB
                compressionEnabled: true,
                compressionThreshold: 1024, // 1KB
                ttl: 24 * 60 * 60 * 1000, // 24 hours
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            };
            
            this.cacheStats = {
                hits: 0,
                misses: 0,
                sets: 0,
                deletes: 0,
                compressions: 0,
                totalSize: 0
            };
            
            this.isInitialized = false;
            this.compressionWorker = null;
            
            this._initializeCache();
        }

        /**
         * Initialize the cache system
         */
        async _initializeCache() {
            try {
                // Initialize IndexedDB
                await this._initializeIndexedDB();
                
                // Initialize Service Worker
                await this._initializeServiceWorker();
                
                // Initialize compression worker
                await this._initializeCompressionWorker();
                
                // Load existing cache data
                await this._loadExistingCache();
                
                // Start cache cleanup
                this._startCacheCleanup();
                
                this.isInitialized = true;
                console.log('✅ Advanced cache system initialized');
            } catch (error) {
                console.error('❌ Failed to initialize cache system:', error);
            }
        }

        /**
         * Get cached data
         */
        async get(key, options = {}) {
            if (!this.isInitialized) {
                await this._waitForInitialization();
            }
            
            const cacheKey = this._generateCacheKey(key);
            const startTime = performance.now();
            
            try {
                // Try memory cache first
                let data = this._getFromMemory(cacheKey);
                if (data) {
                    this.cacheStats.hits++;
                    return this._processCachedData(data, options);
                }
                
                // Try localStorage
                data = await this._getFromLocalStorage(cacheKey);
                if (data) {
                    this.cacheStats.hits++;
                    // Store in memory for faster access
                    this._setInMemory(cacheKey, data);
                    return this._processCachedData(data, options);
                }
                
                // Try IndexedDB
                data = await this._getFromIndexedDB(cacheKey);
                if (data) {
                    this.cacheStats.hits++;
                    // Store in memory and localStorage for faster access
                    this._setInMemory(cacheKey, data);
                    await this._setInLocalStorage(cacheKey, data);
                    return this._processCachedData(data, options);
                }
                
                // Try Service Worker cache
                data = await this._getFromServiceWorker(cacheKey);
                if (data) {
                    this.cacheStats.hits++;
                    // Store in all layers for faster access
                    this._setInMemory(cacheKey, data);
                    await this._setInLocalStorage(cacheKey, data);
                    await this._setInIndexedDB(cacheKey, data);
                    return this._processCachedData(data, options);
                }
                
                this.cacheStats.misses++;
                return null;
            } catch (error) {
                console.error('Cache get error:', error);
                this.cacheStats.misses++;
                return null;
            } finally {
                const duration = performance.now() - startTime;
                if (duration > 100) {
                    console.warn(`Slow cache get: ${key} (${duration.toFixed(2)}ms)`);
                }
            }
        }

        /**
         * Set cached data
         */
        async set(key, data, options = {}) {
            if (!this.isInitialized) {
                await this._waitForInitialization();
            }
            
            const cacheKey = this._generateCacheKey(key);
            const startTime = performance.now();
            
            try {
                // Prepare data for caching
                const cacheData = {
                    data: data,
                    timestamp: Date.now(),
                    ttl: options.ttl || this.cacheConfig.ttl,
                    compressed: false,
                    size: this._calculateSize(data)
                };
                
                // Compress if needed
                if (this.cacheConfig.compressionEnabled && 
                    cacheData.size > this.cacheConfig.compressionThreshold) {
                    cacheData.data = await this._compressData(data);
                    cacheData.compressed = true;
                    this.cacheStats.compressions++;
                }
                
                // Store in all cache layers
                this._setInMemory(cacheKey, cacheData);
                await this._setInLocalStorage(cacheKey, cacheData);
                await this._setInIndexedDB(cacheKey, cacheData);
                await this._setInServiceWorker(cacheKey, cacheData);
                
                this.cacheStats.sets++;
                this.cacheStats.totalSize += cacheData.size;
                
                // Cleanup if needed
                await this._cleanupIfNeeded();
                
            } catch (error) {
                console.error('Cache set error:', error);
            } finally {
                const duration = performance.now() - startTime;
                if (duration > 100) {
                    console.warn(`Slow cache set: ${key} (${duration.toFixed(2)}ms)`);
                }
            }
        }

        /**
         * Delete cached data
         */
        async delete(key) {
            if (!this.isInitialized) {
                await this._waitForInitialization();
            }
            
            const cacheKey = this._generateCacheKey(key);
            
            try {
                // Remove from all cache layers
                this._deleteFromMemory(cacheKey);
                await this._deleteFromLocalStorage(cacheKey);
                await this._deleteFromIndexedDB(cacheKey);
                await this._deleteFromServiceWorker(cacheKey);
                
                this.cacheStats.deletes++;
            } catch (error) {
                console.error('Cache delete error:', error);
            }
        }

        /**
         * Clear all cache data
         */
        async clear() {
            if (!this.isInitialized) {
                await this._waitForInitialization();
            }
            
            try {
                // Clear all cache layers
                this.cacheLayers.memory.clear();
                await this._clearLocalStorage();
                await this._clearIndexedDB();
                await this._clearServiceWorker();
                
                // Reset stats
                this.cacheStats = {
                    hits: 0,
                    misses: 0,
                    sets: 0,
                    deletes: 0,
                    compressions: 0,
                    totalSize: 0
                };
                
                console.log('✅ Cache cleared');
            } catch (error) {
                console.error('Cache clear error:', error);
            }
        }

        /**
         * Get cache statistics
         */
        getStats() {
            return {
                ...this.cacheStats,
                hitRate: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) * 100,
                memorySize: this._getMemoryCacheSize(),
                isInitialized: this.isInitialized
            };
        }

        /**
         * Preload cache with data
         */
        async preload(dataMap) {
            if (!this.isInitialized) {
                await this._waitForInitialization();
            }
            
            console.log('🔄 Preloading cache with', Object.keys(dataMap).length, 'items');
            
            const startTime = performance.now();
            let loadedCount = 0;
            
            for (const [key, data] of Object.entries(dataMap)) {
                try {
                    await this.set(key, data);
                    loadedCount++;
                } catch (error) {
                    console.error(`Failed to preload ${key}:`, error);
                }
            }
            
            const duration = performance.now() - startTime;
            console.log(`✅ Preloaded ${loadedCount} items in ${duration.toFixed(2)}ms`);
        }

        /**
         * Warm cache with frequently used data
         */
        async warmCache() {
            if (!this.isInitialized) {
                await this._waitForInitialization();
            }
            
            console.log('🔥 Warming cache...');
            
            // Preload common scripts
            const commonScripts = [
                'scripts/ui-utils.js',
                'scripts/notification-system.js',
                'scripts/header-system.js',
                'scripts/data-utils.js'
            ];
            
            for (const script of commonScripts) {
                try {
                    const response = await fetch(script);
                    if (response.ok) {
                        const content = await response.text();
                        await this.set(`script:${script}`, content);
                    }
                } catch (error) {
                    console.warn(`Failed to warm cache for ${script}:`, error);
                }
            }
            
            console.log('✅ Cache warmed');
        }

        /**
         * Get from memory cache
         */
        _getFromMemory(key) {
            const data = this.cacheLayers.memory.get(key);
            if (data && this._isValid(data)) {
                return data;
            }
            if (data) {
                this.cacheLayers.memory.delete(key);
            }
            return null;
        }

        /**
         * Set in memory cache
         */
        _setInMemory(key, data) {
            // Check memory limit
            if (this._getMemoryCacheSize() > this.cacheConfig.maxMemorySize) {
                this._evictFromMemory();
            }
            
            this.cacheLayers.memory.set(key, data);
        }

        /**
         * Delete from memory cache
         */
        _deleteFromMemory(key) {
            this.cacheLayers.memory.delete(key);
        }

        /**
         * Get from localStorage
         */
        async _getFromLocalStorage(key) {
            try {
                const stored = localStorage.getItem(this.cacheLayers.localStorage + key);
                if (stored) {
                    const data = JSON.parse(stored);
                    if (this._isValid(data)) {
                        return data;
                    } else {
                        localStorage.removeItem(this.cacheLayers.localStorage + key);
                    }
                }
            } catch (error) {
                console.warn('LocalStorage get error:', error);
            }
            return null;
        }

        /**
         * Set in localStorage
         */
        async _setInLocalStorage(key, data) {
            try {
                const serialized = JSON.stringify(data);
                if (serialized.length > this.cacheConfig.maxLocalStorageSize) {
                    return; // Skip if too large
                }
                
                localStorage.setItem(this.cacheLayers.localStorage + key, serialized);
            } catch (error) {
                console.warn('LocalStorage set error:', error);
            }
        }

        /**
         * Delete from localStorage
         */
        async _deleteFromLocalStorage(key) {
            try {
                localStorage.removeItem(this.cacheLayers.localStorage + key);
            } catch (error) {
                console.warn('LocalStorage delete error:', error);
            }
        }

        /**
         * Clear localStorage
         */
        async _clearLocalStorage() {
            try {
                const keys = Object.keys(localStorage);
                for (const key of keys) {
                    if (key.startsWith(this.cacheLayers.localStorage)) {
                        localStorage.removeItem(key);
                    }
                }
            } catch (error) {
                console.warn('LocalStorage clear error:', error);
            }
        }

        /**
         * Initialize IndexedDB
         */
        async _initializeIndexedDB() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.cacheLayers.indexedDB, 1);
                
                request.onerror = () => reject(request.error);
                request.onsuccess = () => {
                    this.indexedDB = request.result;
                    resolve();
                };
                
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('cache')) {
                        const store = db.createObjectStore('cache', { keyPath: 'key' });
                        store.createIndex('timestamp', 'timestamp', { unique: false });
                    }
                };
            });
        }

        /**
         * Get from IndexedDB
         */
        async _getFromIndexedDB(key) {
            if (!this.indexedDB) return null;
            
            try {
                const transaction = this.indexedDB.transaction(['cache'], 'readonly');
                const store = transaction.objectStore('cache');
                const request = store.get(key);
                
                return new Promise((resolve) => {
                    request.onsuccess = () => {
                        const data = request.result;
                        if (data && this._isValid(data)) {
                            resolve(data);
                        } else {
                            if (data) {
                                this._deleteFromIndexedDB(key);
                            }
                            resolve(null);
                        }
                    };
                    request.onerror = () => resolve(null);
                });
            } catch (error) {
                console.warn('IndexedDB get error:', error);
                return null;
            }
        }

        /**
         * Set in IndexedDB
         */
        async _setInIndexedDB(key, data) {
            if (!this.indexedDB) return;
            
            try {
                const transaction = this.indexedDB.transaction(['cache'], 'readwrite');
                const store = transaction.objectStore('cache');
                store.put({ key, ...data });
            } catch (error) {
                console.warn('IndexedDB set error:', error);
            }
        }

        /**
         * Delete from IndexedDB
         */
        async _deleteFromIndexedDB(key) {
            if (!this.indexedDB) return;
            
            try {
                const transaction = this.indexedDB.transaction(['cache'], 'readwrite');
                const store = transaction.objectStore('cache');
                store.delete(key);
            } catch (error) {
                console.warn('IndexedDB delete error:', error);
            }
        }

        /**
         * Clear IndexedDB
         */
        async _clearIndexedDB() {
            if (!this.indexedDB) return;
            
            try {
                const transaction = this.indexedDB.transaction(['cache'], 'readwrite');
                const store = transaction.objectStore('cache');
                store.clear();
            } catch (error) {
                console.warn('IndexedDB clear error:', error);
            }
        }

        /**
         * Initialize Service Worker
         */
        async _initializeServiceWorker() {
            if (!('serviceWorker' in navigator)) return;
            
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                this.serviceWorker = registration;
                console.log('Service Worker registered');
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        }

        /**
         * Get from Service Worker cache
         */
        async _getFromServiceWorker(key) {
            if (!this.serviceWorker) return null;
            
            try {
                const cache = await caches.open(this.cacheLayers.serviceWorker);
                const response = await cache.match(key);
                if (response) {
                    const data = await response.json();
                    if (this._isValid(data)) {
                        return data;
                    } else {
                        await cache.delete(key);
                    }
                }
            } catch (error) {
                console.warn('Service Worker get error:', error);
            }
            return null;
        }

        /**
         * Set in Service Worker cache
         */
        async _setInServiceWorker(key, data) {
            if (!this.serviceWorker) return;
            
            try {
                const cache = await caches.open(this.cacheLayers.serviceWorker);
                const response = new Response(JSON.stringify(data));
                // Convert key to valid URL for Service Worker cache
                const cacheKey = key.startsWith('http') ? key : `cache://${key}`;
                await cache.put(cacheKey, response);
            } catch (error) {
                console.warn('Service Worker set error:', error);
            }
        }

        /**
         * Delete from Service Worker cache
         */
        async _deleteFromServiceWorker(key) {
            if (!this.serviceWorker) return;
            
            try {
                const cache = await caches.open(this.cacheLayers.serviceWorker);
                await cache.delete(key);
            } catch (error) {
                console.warn('Service Worker delete error:', error);
            }
        }

        /**
         * Clear Service Worker cache
         */
        async _clearServiceWorker() {
            if (!this.serviceWorker) return;
            
            try {
                const cache = await caches.open(this.cacheLayers.serviceWorker);
                await cache.delete(this.cacheLayers.serviceWorker);
            } catch (error) {
                console.warn('Service Worker clear error:', error);
            }
        }

        /**
         * Initialize compression worker
         */
        async _initializeCompressionWorker() {
            if (!this.cacheConfig.compressionEnabled) return;
            
            try {
                // Create a simple compression worker
                const workerCode = `
                    self.onmessage = function(e) {
                        const { data, type } = e.data;
                        if (type === 'compress') {
                            try {
                                const compressed = LZString.compress(JSON.stringify(data));
                                self.postMessage({ success: true, data: compressed });
                            } catch (error) {
                                self.postMessage({ success: false, error: error.message });
                            }
                        } else if (type === 'decompress') {
                            try {
                                const decompressed = JSON.parse(LZString.decompress(data));
                                self.postMessage({ success: true, data: decompressed });
                            } catch (error) {
                                self.postMessage({ success: false, error: error.message });
                            }
                        }
                    };
                `;
                
                const blob = new Blob([workerCode], { type: 'application/javascript' });
                this.compressionWorker = new Worker(URL.createObjectURL(blob));
            } catch (error) {
                console.warn('Compression worker initialization failed:', error);
            }
        }

        /**
         * Compress data
         */
        async _compressData(data) {
            try {
                // Use LZString if available
                if (typeof window.LZString !== 'undefined') {
                    return window.LZString.compress(JSON.stringify(data));
                }
                // Fallback to simple compression
                return btoa(JSON.stringify(data));
            } catch (error) {
                console.warn('Compression failed, using plain data:', error);
                return JSON.stringify(data);
            }
        }

        /**
         * Decompress data
         */
        async _decompressData(data) {
            try {
                // Use LZString if available
                if (typeof window.LZString !== 'undefined') {
                    const decompressed = window.LZString.decompress(data);
                    return JSON.parse(decompressed);
                }
                // Fallback to simple decompression
                return JSON.parse(atob(data));
            } catch (error) {
                console.warn('Decompression failed, trying plain parse:', error);
                try {
                    return JSON.parse(data);
                } catch (e) {
                    return data;
                }
            }
        }

        /**
         * Process cached data
         */
        async _processCachedData(data, options) {
            if (data.compressed) {
                try {
                    data.data = await this._decompressData(data.data);
                } catch (error) {
                    console.warn('Decompression failed:', error);
                    return null;
                }
            }
            
            return data.data;
        }

        /**
         * Generate cache key
         */
        _generateCacheKey(key) {
            return `init-cache-${key}`;
        }

        /**
         * Check if cached data is valid
         */
        _isValid(data) {
            if (!data || !data.timestamp) return false;
            
            const age = Date.now() - data.timestamp;
            return age < data.ttl && age < this.cacheConfig.maxAge;
        }

        /**
         * Calculate data size
         */
        _calculateSize(data) {
            return JSON.stringify(data).length * 2; // Rough estimate
        }

        /**
         * Get memory cache size
         */
        _getMemoryCacheSize() {
            let size = 0;
            for (const [key, value] of this.cacheLayers.memory) {
                size += key.length + this._calculateSize(value);
            }
            return size;
        }

        /**
         * Evict from memory cache
         */
        _evictFromMemory() {
            // Simple LRU eviction
            const entries = Array.from(this.cacheLayers.memory.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            
            // Remove oldest 25% of entries
            const toRemove = Math.ceil(entries.length * 0.25);
            for (let i = 0; i < toRemove; i++) {
                this.cacheLayers.memory.delete(entries[i][0]);
            }
        }

        /**
         * Cleanup if needed
         */
        async _cleanupIfNeeded() {
            // Cleanup expired entries
            const now = Date.now();
            for (const [key, data] of this.cacheLayers.memory) {
                if (!this._isValid(data)) {
                    this.cacheLayers.memory.delete(key);
                }
            }
        }

        /**
         * Start cache cleanup
         */
        _startCacheCleanup() {
            // Cleanup every hour
            setInterval(() => {
                this._cleanupIfNeeded();
            }, 60 * 60 * 1000);
        }

        /**
         * Load existing cache data
         */
        async _loadExistingCache() {
            // Load critical data from localStorage
            const criticalKeys = ['user-preferences', 'system-config', 'cache-stats'];
            for (const key of criticalKeys) {
                const data = await this._getFromLocalStorage(key);
                if (data) {
                    this._setInMemory(key, data);
                }
            }
        }

        /**
         * Wait for initialization
         */
        async _waitForInitialization() {
            while (!this.isInitialized) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    }

    // Create global instance
    window.InitAdvancedCache = new InitAdvancedCache();
    
    // Auto-warm cache when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.InitAdvancedCache.warmCache();
        });
    } else {
        window.InitAdvancedCache.warmCache();
    }

})();
