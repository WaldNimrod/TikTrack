/**
 * Frontend Cache Manager - TikTrack
 * =================================
 *
 * מנהל מטמון מרכזי לכל הfrontend של TikTrack
 * מאחד את כל מערכות המטמון השונות תחת ממשק אחיד
 *
 * תכונות:
 * - TTL-based caching עם ניהול תלויות
 * - Namespace management לסוגי נתונים שונים
 * - Cache statistics ו-monitoring
 * - Integration עם backend cache system
 * - Memory optimization
 * - Dependency-based invalidation
 * - WebSocket integration לreal-time updates
 *
 * Author: TikTrack Development Team
 * Created: September 2025
 * Version: 1.0
 */

class FrontendCacheManager {
  constructor(options = {}) {
    // Configuration
    this.defaultTTL = options.defaultTTL || 300000; // 5 minutes default
    this.maxMemoryMB = options.maxMemoryMB || 50; // 50MB limit
    this.cleanupInterval = options.cleanupInterval || 60000; // 1 minute cleanup

    // Cache storage
    this.cache = new Map();
    this.dependencies = new Map();
    this.namespaces = new Set();

    // Statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      invalidations: 0,
      totalRequests: 0
    };

    // Performance tracking
    this.performanceMetrics = {
      hitRate: 0,
      averageResponseTime: 0,
      memoryUsage: 0,
      lastCleanup: Date.now()
    };

    // Initialize system
    this._initialize();
  }

  /**
   * Initialize cache system
   */
  _initialize() {
    // Start cleanup worker
    this._startCleanupWorker();

    // Setup WebSocket integration for real-time cache sync
    this._setupWebSocketIntegration();

    // Register global cache clear handler
    this._setupGlobalHandlers();

    // Initialize namespaces for different data types
    this._initializeNamespaces();

    this.log('Frontend Cache Manager initialized', 'info');
  }

  /**
   * Initialize namespaces for different data types
   */
  _initializeNamespaces() {
    const defaultNamespaces = [
      'tickers',
      'trades', 
      'trade_plans',
      'accounts',
      'cash_flows',
      'alerts',
      'executions',
      'notes',
      'external_data',
      'preferences'
    ];

    defaultNamespaces.forEach(ns => this.namespaces.add(ns));
  }

  /**
   * Setup WebSocket integration for real-time cache updates
   */
  _setupWebSocketIntegration() {
    // Integration with existing notification system
    if (window.socket && window.socket.on) {
      window.socket.on('cache_invalidation', (data) => {
        this.invalidateByDependency(data.dependency);
        this.log(`Cache invalidated by WebSocket: ${data.dependency}`, 'info');
      });

      window.socket.on('cache_clear', () => {
        this.clearNamespace('all');
        this.log('Cache cleared by WebSocket', 'info');
      });
    }
  }

  /**
   * Setup global cache handlers
   */
  _setupGlobalHandlers() {
    // Global cache clear function
    window.clearFrontendCache = () => this.clearAll();

    // Global cache stats function  
    window.getFrontendCacheStats = () => this.getStats();

    // Integration with existing cache clear button
    if (typeof window.clearDataCache === 'function') {
      const originalClear = window.clearDataCache;
      window.clearDataCache = () => {
        originalClear();
        this.clearAll();
      };
    }
  }

  /**
   * Start cleanup worker
   */
  _startCleanupWorker() {
    setInterval(() => {
      this._cleanupExpiredEntries();
      this._optimizeMemoryUsage();
      this._updatePerformanceMetrics();
    }, this.cleanupInterval);

    this.log('Cache cleanup worker started', 'info');
  }

  /**
   * Generate cache key with namespace
   */
  _generateKey(namespace, key, params = {}) {
    const paramStr = Object.keys(params).length > 0 ? 
      JSON.stringify(params, Object.keys(params).sort()) : '';
    return `${namespace}:${key}${paramStr ? ':' + btoa(paramStr) : ''}`;
  }

  /**
   * Create cache entry
   */
  _createEntry(data, ttl, dependencies = []) {
    return {
      data,
      ttl,
      dependencies: new Set(dependencies),
      createdAt: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now()
    };
  }

  /**
   * Check if cache entry is expired
   */
  _isExpired(entry) {
    return Date.now() - entry.createdAt > entry.ttl;
  }

  /**
   * Record cache access
   */
  _recordAccess(entry) {
    entry.accessCount++;
    entry.lastAccessed = Date.now();
  }

  /**
   * Set data in cache
   */
  set(namespace, key, data, ttl = null, dependencies = []) {
    try {
      this.namespaces.add(namespace);
      const cacheKey = this._generateKey(namespace, key);
      const effectiveTTL = ttl || this.defaultTTL;

      const entry = this._createEntry(data, effectiveTTL, dependencies);
      this.cache.set(cacheKey, entry);

      // Update dependency mappings
      dependencies.forEach(dep => {
        if (!this.dependencies.has(dep)) {
          this.dependencies.set(dep, new Set());
        }
        this.dependencies.get(dep).add(cacheKey);
      });

      this.stats.sets++;
      this.log(`Cache set: ${namespace}:${key} (TTL: ${effectiveTTL}ms)`, 'debug');

      return true;
    } catch (error) {
      this.log(`Failed to set cache: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Get data from cache
   */
  get(namespace, key, params = {}) {
    try {
      const cacheKey = this._generateKey(namespace, key, params);
      const entry = this.cache.get(cacheKey);

      if (!entry) {
        this.stats.misses++;
        this.stats.totalRequests++;
        return null;
      }

      if (this._isExpired(entry)) {
        this.delete(namespace, key, params);
        this.stats.misses++;
        this.stats.totalRequests++;
        return null;
      }

      this._recordAccess(entry);
      this.stats.hits++;
      this.stats.totalRequests++;

      this.log(`Cache hit: ${namespace}:${key}`, 'debug');
      return entry.data;
    } catch (error) {
      this.log(`Failed to get cache: ${error.message}`, 'error');
      this.stats.misses++;
      this.stats.totalRequests++;
      return null;
    }
  }

  /**
   * Delete specific cache entry
   */
  delete(namespace, key, params = {}) {
    try {
      const cacheKey = this._generateKey(namespace, key, params);
      const entry = this.cache.get(cacheKey);

      if (entry) {
        // Remove from dependency mappings
        entry.dependencies.forEach(dep => {
          if (this.dependencies.has(dep)) {
            this.dependencies.get(dep).delete(cacheKey);
            if (this.dependencies.get(dep).size === 0) {
              this.dependencies.delete(dep);
            }
          }
        });

        this.cache.delete(cacheKey);
        this.stats.deletes++;
        this.log(`Cache deleted: ${namespace}:${key}`, 'debug');
        return true;
      }

      return false;
    } catch (error) {
      this.log(`Failed to delete cache: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Clear entire namespace
   */
  clearNamespace(namespace) {
    try {
      if (namespace === 'all') {
        const size = this.cache.size;
        this.cache.clear();
        this.dependencies.clear();
        this.stats.deletes += size;
        this.log(`All cache cleared: ${size} entries`, 'info');
        return size;
      }

      let deletedCount = 0;
      const keysToDelete = [];

      for (const [cacheKey, entry] of this.cache.entries()) {
        if (cacheKey.startsWith(`${namespace}:`)) {
          keysToDelete.push(cacheKey);
        }
      }

      keysToDelete.forEach(key => {
        const entry = this.cache.get(key);
        if (entry) {
          // Remove from dependencies
          entry.dependencies.forEach(dep => {
            if (this.dependencies.has(dep)) {
              this.dependencies.get(dep).delete(key);
              if (this.dependencies.get(dep).size === 0) {
                this.dependencies.delete(dep);
              }
            }
          });
        }
        this.cache.delete(key);
        deletedCount++;
      });

      this.stats.deletes += deletedCount;
      this.log(`Namespace '${namespace}' cleared: ${deletedCount} entries`, 'info');
      return deletedCount;
    } catch (error) {
      this.log(`Failed to clear namespace: ${error.message}`, 'error');
      return 0;
    }
  }

  /**
   * Clear all cache
   */
  clearAll() {
    return this.clearNamespace('all');
  }

  /**
   * Invalidate cache by dependency
   */
  invalidateByDependency(dependency) {
    try {
      if (!this.dependencies.has(dependency)) {
        return 0;
      }

      const keysToInvalidate = Array.from(this.dependencies.get(dependency));
      let invalidatedCount = 0;

      keysToInvalidate.forEach(key => {
        if (this.cache.has(key)) {
          const entry = this.cache.get(key);
          // Remove from all dependencies
          entry.dependencies.forEach(dep => {
            if (this.dependencies.has(dep)) {
              this.dependencies.get(dep).delete(key);
              if (this.dependencies.get(dep).size === 0) {
                this.dependencies.delete(dep);
              }
            }
          });
          this.cache.delete(key);
          invalidatedCount++;
        }
      });

      this.stats.invalidations += invalidatedCount;
      this.log(`Dependency '${dependency}' invalidated: ${invalidatedCount} entries`, 'info');
      return invalidatedCount;
    } catch (error) {
      this.log(`Failed to invalidate by dependency: ${error.message}`, 'error');
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalEntries = this.cache.size;
    const hitRate = this.stats.totalRequests > 0 ? 
      (this.stats.hits / this.stats.totalRequests * 100) : 0;

    const memoryUsageMB = this._estimateMemoryUsage() / (1024 * 1024);

    return {
      totalEntries,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsageMB: Math.round(memoryUsageMB * 100) / 100,
      maxMemoryMB: this.maxMemoryMB,
      memoryUsagePercent: Math.round((memoryUsageMB / this.maxMemoryMB) * 100),
      stats: { ...this.stats },
      namespaces: Array.from(this.namespaces),
      dependencyCount: this.dependencies.size,
      performanceMetrics: { ...this.performanceMetrics }
    };
  }

  /**
   * Estimate memory usage in bytes
   */
  _estimateMemoryUsage() {
    let totalSize = 0;

    for (const [key, entry] of this.cache.entries()) {
      // Key size
      totalSize += new Blob([key]).size;
      
      // Entry size (rough estimation)
      try {
        totalSize += new Blob([JSON.stringify(entry.data)]).size;
        totalSize += 200; // Overhead for entry metadata
      } catch {
        totalSize += 1024; // 1KB fallback estimation
      }
    }

    return totalSize;
  }

  /**
   * Cleanup expired entries
   */
  _cleanupExpiredEntries() {
    let cleanedCount = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (this._isExpired(entry)) {
        // Remove from dependencies
        entry.dependencies.forEach(dep => {
          if (this.dependencies.has(dep)) {
            this.dependencies.get(dep).delete(key);
            if (this.dependencies.get(dep).size === 0) {
              this.dependencies.delete(dep);
            }
          }
        });

        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.stats.deletes += cleanedCount;
      this.log(`Cleaned ${cleanedCount} expired entries`, 'debug');
    }

    this.performanceMetrics.lastCleanup = now;
  }

  /**
   * Optimize memory usage
   */
  _optimizeMemoryUsage() {
    const memoryUsageMB = this._estimateMemoryUsage() / (1024 * 1024);
    
    if (memoryUsageMB <= this.maxMemoryMB * 0.8) {
      return; // Memory usage is acceptable
    }

    // Sort entries by access frequency and recency
    const entries = Array.from(this.cache.entries());
    entries.sort(([, a], [, b]) => {
      // Priority: access count (higher is better) then recency (newer is better)
      const scoreA = a.accessCount * 1000 + a.lastAccessed;
      const scoreB = b.accessCount * 1000 + b.lastAccessed;
      return scoreA - scoreB; // Lower score = less important
    });

    // Remove least important entries
    let removedCount = 0;
    const targetMemory = this.maxMemoryMB * 0.7 * 1024 * 1024; // Target 70% of max

    for (const [key, entry] of entries) {
      if (this._estimateMemoryUsage() <= targetMemory) {
        break;
      }

      // Remove from dependencies
      entry.dependencies.forEach(dep => {
        if (this.dependencies.has(dep)) {
          this.dependencies.get(dep).delete(key);
          if (this.dependencies.get(dep).size === 0) {
            this.dependencies.delete(dep);
          }
        }
      });

      this.cache.delete(key);
      removedCount++;
    }

    if (removedCount > 0) {
      this.stats.deletes += removedCount;
      this.log(`Memory optimization: removed ${removedCount} entries`, 'info');
    }
  }

  /**
   * Update performance metrics
   */
  _updatePerformanceMetrics() {
    this.performanceMetrics.hitRate = this.stats.totalRequests > 0 ? 
      (this.stats.hits / this.stats.totalRequests * 100) : 0;
    
    this.performanceMetrics.memoryUsage = this._estimateMemoryUsage() / (1024 * 1024);
  }

  /**
   * Logging function
   */
  log(message, level = 'info') {
    if (window.console && window.console[level]) {
      const timestamp = new Date().toLocaleTimeString('he-IL');
      window.console[level](`[FrontendCache] [${timestamp}] ${message}`);
    }
  }

  /**
   * ===== PUBLIC API METHODS =====
   */

  /**
   * Cache data with automatic namespace detection
   */
  cacheData(namespace, key, data, options = {}) {
    const {
      ttl = this.defaultTTL,
      dependencies = [],
      params = {}
    } = options;

    return this.set(namespace, key, data, ttl, dependencies);
  }

  /**
   * Get cached data with automatic namespace detection
   */
  getCachedData(namespace, key, options = {}) {
    const { params = {} } = options;
    return this.get(namespace, key, params);
  }

  /**
   * Cache function result (decorator pattern)
   */
  async cacheFunction(namespace, functionName, fn, options = {}) {
    const cached = this.get(namespace, functionName);
    if (cached !== null) {
      this.log(`Function cache hit: ${namespace}:${functionName}`, 'debug');
      return cached;
    }

    const result = await fn();
    this.set(namespace, functionName, result, options.ttl, options.dependencies);
    this.log(`Function cached: ${namespace}:${functionName}`, 'debug');
    return result;
  }

  /**
   * Integration with existing ticker service cache
   */
  integrateLegacyCaches() {
    // Migrate ticker-service.js caches
    if (window.tickersCache) {
      this.set('tickers', 'all', window.tickersCache, this.defaultTTL, ['tickers']);
      window.tickersCache = null; // Clear old cache
    }

    if (window.tradesCache) {
      this.set('trades', 'all', window.tradesCache, this.defaultTTL, ['trades']);
      window.tradesCache = null; // Clear old cache
    }

    if (window.plansCache) {
      this.set('trade_plans', 'all', window.plansCache, this.defaultTTL, ['trade_plans']);
      window.plansCache = null; // Clear old cache
    }

    // Migrate external-data-service cache if present
    if (window.externalDataService && window.externalDataService.cache) {
      const externalCache = window.externalDataService.cache;
      for (const [key, value] of externalCache.entries()) {
        if (this._isValidExternalCacheEntry(value)) {
          this.set('external_data', key, value.data, this.defaultTTL, ['external_data']);
        }
      }
    }

    this.log('Legacy caches integrated successfully', 'info');
  }

  /**
   * Check if external cache entry is valid
   */
  _isValidExternalCacheEntry(entry) {
    return entry && 
           entry.timestamp && 
           entry.data && 
           (Date.now() - entry.timestamp < this.defaultTTL);
  }

  /**
   * Export cache for debugging
   */
  exportCache() {
    const export_data = {
      cache: {},
      dependencies: {},
      stats: this.stats,
      metrics: this.performanceMetrics,
      namespaces: Array.from(this.namespaces),
      timestamp: Date.now()
    };

    // Convert Map to plain object for JSON serialization
    for (const [key, value] of this.cache.entries()) {
      export_data.cache[key] = {
        ...value,
        dependencies: Array.from(value.dependencies)
      };
    }

    for (const [key, value] of this.dependencies.entries()) {
      export_data.dependencies[key] = Array.from(value);
    }

    return export_data;
  }

  /**
   * ===== INTEGRATION METHODS =====
   */

  /**
   * Integration method for ticker-service.js
   */
  getTickersCache() {
    return this.get('tickers', 'all') || [];
  }

  setTickersCache(data) {
    return this.set('tickers', 'all', data, this.defaultTTL, ['tickers', 'ticker_list']);
  }

  getTradesCache() {
    return this.get('trades', 'all') || [];
  }

  setTradesCache(data) {
    return this.set('trades', 'all', data, this.defaultTTL, ['trades', 'trade_list']);
  }

  getPlansCache() {
    return this.get('trade_plans', 'all') || [];
  }

  setPlansCache(data) {
    return this.set('trade_plans', 'all', data, this.defaultTTL, ['trade_plans', 'plan_list']);
  }

  /**
   * Check if any cache exists for namespace
   */
  hasCache(namespace, key = null) {
    if (key) {
      const cacheKey = this._generateKey(namespace, key);
      return this.cache.has(cacheKey) && !this._isExpired(this.cache.get(cacheKey));
    }

    // Check if any cache exists for namespace
    for (const [cacheKey] of this.cache.entries()) {
      if (cacheKey.startsWith(`${namespace}:`)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get cache age in milliseconds
   */
  getCacheAge(namespace, key, params = {}) {
    const cacheKey = this._generateKey(namespace, key, params);
    const entry = this.cache.get(cacheKey);
    
    if (!entry || this._isExpired(entry)) {
      return null;
    }

    return Date.now() - entry.createdAt;
  }

  /**
   * Force refresh cache entry
   */
  async forceRefresh(namespace, key, refreshFunction, options = {}) {
    // Delete existing cache
    this.delete(namespace, key, options.params);

    // Execute refresh function
    const newData = await refreshFunction();

    // Cache new data
    this.set(namespace, key, newData, options.ttl, options.dependencies);

    return newData;
  }
}

// ===== GLOBAL INITIALIZATION =====

// Create global instance
window.frontendCacheManager = new FrontendCacheManager({
  defaultTTL: 300000, // 5 minutes
  maxMemoryMB: 50,    // 50MB limit
  cleanupInterval: 60000 // 1 minute cleanup
});

// Export to window for global access
window.FrontendCacheManager = FrontendCacheManager;

// ===== INTEGRATION WITH EXISTING SYSTEMS =====

/**
 * Integration function to be called after page load
 */
function initializeFrontendCache() {
  try {
    // Integrate existing caches
    window.frontendCacheManager.integrateLegacyCaches();

    // Setup global shortcuts
    window.clearFrontendCache = () => window.frontendCacheManager.clearAll();
    window.getFrontendCacheStats = () => window.frontendCacheManager.getStats();

    // Log initialization
    window.frontendCacheManager.log('Frontend Cache Manager ready', 'info');

    return true;
  } catch (error) {
    if (window.console && window.console.error) {
      console.error('[FrontendCache] Initialization failed:', error);
    }
    return false;
  }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFrontendCache);
} else {
  // DOM already loaded
  setTimeout(initializeFrontendCache, 100);
}

// Export initialization function
window.initializeFrontendCache = initializeFrontendCache;