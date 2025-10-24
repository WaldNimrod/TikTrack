# Cache Manager - מפרט מלא

## סקירה

**מטרה:** Cache Manager חכם עם dependencies mapping  
**זמן:** 2 שבועות  
**תוצאה:** מערכת cache פשוטה ויעילה

---

## ארכיטקטורה

### Dependencies Mapping

```javascript
/**
 * Cache Dependencies Configuration
 * מפת תלויות מטמון
 */
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
```

### TTL Policies

```javascript
const TTL_POLICIES = {
  // User data - long cache
  'user-preferences': 'long',      // 24 hours
  'user-profile': 'long',          // 24 hours
  
  // Account data - medium cache
  'accounts-data': 'medium',       // 30 minutes
  'account-{id}': 'medium',        // 30 minutes
  
  // Trading data - short cache
  'trades-data': 'short',          // 5 minutes
  'trade-{id}': 'short',           // 5 minutes
  'executions-data': 'short',      // 5 minutes
  
  // Market data - very short cache
  'market-data': 'very-short',     // 1 minute
  'quote-{symbol}': 'very-short',  // 1 minute
  
  // Dashboard - medium cache
  'dashboard-data': 'medium',      // 30 minutes
  'statistics-data': 'medium'      // 30 minutes
};

const TTL_VALUES = {
  'very-short': 1 * 60 * 1000,     // 1 minute
  'short': 5 * 60 * 1000,          // 5 minutes
  'medium': 30 * 60 * 1000,        // 30 minutes
  'long': 24 * 60 * 60 * 1000      // 24 hours
};
```

---

## API מלא

### Core Methods

```javascript
class CacheManager {
  /**
   * Get data from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Cached data or null
   */
  static async get(key) {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { data, expiry, version } = JSON.parse(cached);
      
      // Check expiry
      if (Date.now() > expiry) {
        localStorage.removeItem(key);
        return null;
      }
      
      // Check version (for cache invalidation)
      if (version && !this.isVersionValid(key, version)) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (error) {
      Logger.error('Cache get error', { key, error });
      return null;
    }
  }

  /**
   * Set data in cache
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {string} ttl - TTL policy
   * @param {object} options - Additional options
   */
  static set(key, data, ttl = 'medium', options = {}) {
    try {
      const expiry = Date.now() + TTL_VALUES[ttl];
      const version = options.version || this.getCurrentVersion(key);
      
      const cacheEntry = {
        data,
        expiry,
        version,
        timestamp: Date.now(),
        ttl
      };

      localStorage.setItem(key, JSON.stringify(cacheEntry));
      
      Logger.debug('Cache set', { key, ttl, size: JSON.stringify(data).length });
    } catch (error) {
      Logger.error('Cache set error', { key, error });
    }
  }

  /**
   * Remove specific key
   * @param {string} key - Cache key to remove
   */
  static remove(key) {
    localStorage.removeItem(key);
    Logger.debug('Cache removed', { key });
  }

  /**
   * Invalidate by dependency chain
   * @param {string} changedKey - Key that changed
   */
  static invalidateByDependency(changedKey) {
    const toInvalidate = this.findDependentKeys(changedKey);
    
    toInvalidate.forEach(key => {
      this.remove(key);
      // Recursive invalidation
      this.invalidateByDependency(key);
    });
    
    Logger.info('Cache invalidated by dependency', { 
      changedKey, 
      invalidated: toInvalidate.length 
    });
  }

  /**
   * Clear cache by pattern
   * @param {string} pattern - Pattern to match (supports *)
   */
  static invalidate(pattern) {
    const keys = Object.keys(localStorage);
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    
    const matchedKeys = keys.filter(key => regex.test(key));
    matchedKeys.forEach(key => localStorage.removeItem(key));
    
    Logger.info('Cache cleared by pattern', { pattern, count: matchedKeys.length });
  }

  /**
   * Clear all cache
   */
  static clear() {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith('cache-'));
    
    cacheKeys.forEach(key => localStorage.removeItem(key));
    
    Logger.info('Cache cleared', { count: cacheKeys.length });
  }
}
```

### Advanced Methods

```javascript
class CacheManager {
  /**
   * Get multiple keys at once
   * @param {string[]} keys - Array of keys
   * @returns {Promise<Object>} - Object with key-value pairs
   */
  static async getMultiple(keys) {
    const results = {};
    
    for (const key of keys) {
      results[key] = await this.get(key);
    }
    
    return results;
  }

  /**
   * Set multiple keys at once
   * @param {Object} data - Object with key-value pairs
   * @param {string} ttl - TTL policy
   */
  static setMultiple(data, ttl = 'medium') {
    Object.entries(data).forEach(([key, value]) => {
      this.set(key, value, ttl);
    });
  }

  /**
   * Check if key exists and is valid
   * @param {string} key - Cache key
   * @returns {boolean} - True if valid
   */
  static has(key) {
    const cached = localStorage.getItem(key);
    if (!cached) return false;
    
    try {
      const { expiry } = JSON.parse(cached);
      return Date.now() <= expiry;
    } catch {
      return false;
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache stats
   */
  static getStats() {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith('cache-'));
    
    let totalSize = 0;
    let expiredCount = 0;
    
    cacheKeys.forEach(key => {
      const cached = localStorage.getItem(key);
      if (cached) {
        totalSize += cached.length;
        
        try {
          const { expiry } = JSON.parse(cached);
          if (Date.now() > expiry) expiredCount++;
        } catch {
          expiredCount++;
        }
      }
    });
    
    return {
      totalKeys: cacheKeys.length,
      totalSize: totalSize,
      expiredKeys: expiredCount,
      validKeys: cacheKeys.length - expiredCount
    };
  }
}
```

---

## Integration Examples

### Basic Usage

```javascript
// Simple cache
await CacheManager.set('user-preferences', { theme: 'dark' }, 'long');
const preferences = await CacheManager.get('user-preferences');

// With dependency invalidation
await CacheManager.set('account-123', accountData, 'medium');
// This will automatically invalidate: trades-data, executions-data, etc.
CacheManager.invalidateByDependency('accounts-data');
```

### Advanced Usage

```javascript
// Multiple keys
const data = await CacheManager.getMultiple([
  'user-preferences',
  'accounts-data',
  'trades-data'
]);

// Pattern clearing
CacheManager.invalidate('trades-*'); // Clear all trade-related cache

// Statistics
const stats = CacheManager.getStats();
console.log(`Cache: ${stats.validKeys}/${stats.totalKeys} valid`);
```

---

## Migration Strategy

### שלב 1: הכנה
1. יצירת CacheManager חדש
2. הגדרת dependencies mapping
3. בדיקות יחידה

### שלב 2: אינטגרציה
1. החלפת UnifiedCacheManager
2. עדכון כל 99 מערכות
3. בדיקות אינטגרציה

### שלב 3: אופטימיזציה
1. ניטור ביצועים
2. כוונון TTL policies
3. ניקוי cache אוטומטי

---

## Testing Plan

### Unit Tests (10 tests)
- [ ] Basic set/get
- [ ] TTL expiry
- [ ] Dependencies invalidation
- [ ] Pattern matching
- [ ] Multiple operations
- [ ] Error handling
- [ ] Statistics
- [ ] Version checking
- [ ] Memory management
- [ ] Performance benchmarks

### Integration Tests (5 tests)
- [ ] With API calls
- [ ] With user interactions
- [ ] With page navigation
- [ ] With data updates
- [ ] With error scenarios

---

## Performance Considerations

### Memory Management
- מקסימום 100MB cache
- ניקוי אוטומטי של expired keys
- Compression לנתונים גדולים

### Network Optimization
- Batch API calls
- Smart invalidation
- Background refresh

### Browser Compatibility
- localStorage fallback
- IndexedDB for large data
- Memory pressure handling
