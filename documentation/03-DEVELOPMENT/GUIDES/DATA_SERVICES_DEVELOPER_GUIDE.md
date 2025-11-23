# Data Services Developer Guide - TikTrack

## 1. Introduction

The Data Services system provides a unified layer for all API interactions in TikTrack. Each entity (trades, executions, cash flows, etc.) has a dedicated data service that handles:

- API calls (GET, POST, PUT, DELETE)
- Unified caching via UnifiedCacheManager + CacheTTLGuard
- Cache invalidation via CacheSyncManager
- Standardized error handling
- Promise-based responses

This guide explains how to create, use, and maintain data services for future developers.

---

## 2. File Inventory

| Layer | Path | Notes |
| --- | --- | --- |
| Data Services | `trading-ui/scripts/services/*-data.js` | Entity-specific data services (trades-data.js, executions-data.js, etc.) |
| Cache Systems | `trading-ui/scripts/unified-cache-manager.js`<br>`trading-ui/scripts/cache-ttl-guard.js`<br>`trading-ui/scripts/cache-sync-manager.js` | Unified caching, TTL management, cache synchronization |
| CRUD Handler | `trading-ui/scripts/services/crud-response-handler.js` | Standardized CRUD response handling |
| Page Scripts | `trading-ui/scripts/{entity}.js` | Page controllers that use data services |

---

## 3. Standard Service Template

Every data service must follow this template:

```javascript
/**
 * {Entity Name} Data Service
 * ======================================
 * Unified loader + CRUD helper for {entity} entities.
 * Ensures every operation uses UnifiedCacheManager + CacheTTLGuard policies.
 */
(function {entityName}DataService() {
  const CACHE_KEY = '{entity}-data';
  const DEFAULT_TTL = 60 * 1000; // 60 seconds
  const PAGE_LOG_CONTEXT = { page: '{entity}-data' };

  const DEFAULT_HEADERS = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  };

  const ENDPOINTS = {
    list: '/api/{entity}/',
    detail: (id) => `/api/{entity}/${id}`,
  };

  function resolveBaseUrl() {
    if (typeof window.API_BASE_URL === 'string' && window.API_BASE_URL.length > 0) {
      return window.API_BASE_URL.endsWith('/') ? window.API_BASE_URL : `${window.API_BASE_URL}/`;
    }
    if (window.location?.origin && window.location.origin !== 'null') {
      return window.location.origin.endsWith('/')
        ? window.location.origin
        : `${window.location.origin}/`;
    }
    return '';
  }

  function buildUrl(path) {
    const base = resolveBaseUrl();
    if (!base || path.startsWith('http')) {
      return path;
    }
    return `${base}${path.replace(/^\//, '')}`;
  }

  function normalizeRecord(record) {
    if (!record || typeof record !== 'object') {
      return null;
    }
    return {
      ...record,
      updated_at: record.updated_at || record.created_at || null,
    };
  }

  function normalizePayload(payload) {
    const records = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.records)
          ? payload.records
          : [];
    return records.map(normalizeRecord).filter(Boolean);
  }

  async function saveCache(data, options = {}) {
    if (!window.UnifiedCacheManager?.save) {
      return;
    }
    const ttl = options.ttl ?? DEFAULT_TTL;
    try {
      await window.UnifiedCacheManager.save(CACHE_KEY, data, { ttl });
    } catch (error) {
      window.Logger?.warn?.('⚠️ Failed to save cache', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message,
      });
    }
  }

  async function invalidateCache() {
    // Try CacheSyncManager first (preferred method)
    if (window.CacheSyncManager?.invalidateByAction) {
      try {
        await window.CacheSyncManager.invalidateByAction('{entity}-updated');
        return;
      } catch (error) {
        window.Logger?.warn?.('⚠️ CacheSyncManager.invalidateByAction failed, falling back', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
      }
    }
    
    // Fallback to direct invalidation
    if (!window.UnifiedCacheManager) {
      return;
    }
    if (typeof window.UnifiedCacheManager.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate(CACHE_KEY).catch((error) => {
        window.Logger?.warn?.('⚠️ Failed to invalidate cache', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
      });
      return;
    }
    if (typeof window.UnifiedCacheManager.clearByPattern === 'function') {
      await window.UnifiedCacheManager.clearByPattern(CACHE_KEY).catch((error) => {
        window.Logger?.warn?.('⚠️ Failed to clear cache pattern', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
      });
    }
  }

  function notifyLoadError(message, error) {
    const details = error?.message || message || 'שגיאה בטעינת נתונים';
    window.Logger?.error?.('❌ Load failed', {
      ...PAGE_LOG_CONTEXT,
      error: details,
    });
    window.showErrorNotification?.('שגיאה', `${details} – הנתונים לא זמינים כרגע`);
  }

  async function fetchFromApi(options = {}) {
    const { signal, ttl = DEFAULT_TTL, queryParams } = options;
    const url = buildUrlWithParams(ENDPOINTS.list, queryParams);
    const response = await fetch(url, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
      signal,
    });

    if (!response.ok) {
      const error = new Error(`טעינת נתונים נכשלה (${response.status})`);
      notifyLoadError(error.message, error);
      throw error;
    }

    const payload = await response.json();
    const normalized = normalizePayload(payload);
    await saveCache(normalized, { ttl });
    return normalized;
  }

  async function loadData(options = {}) {
    const { force = false, ttl = DEFAULT_TTL, signal, queryParams } = options;
    const loader = () => fetchFromApi({ signal, ttl, queryParams });

    try {
      if (force) {
        await invalidateCache();
        return await loader();
      }

      if (window.CacheTTLGuard?.ensure) {
        const cached = await window.CacheTTLGuard.ensure(CACHE_KEY, loader, {
          ttl,
          afterRead: (cachedData) => {
            if (Array.isArray(cachedData)) {
              window.Logger?.debug?.('📦 Data served from cache', {
                ...PAGE_LOG_CONTEXT,
                count: cachedData.length,
              });
            }
          },
          afterLoad: (freshData) => {
            window.Logger?.debug?.('🔄 Data fetched from API', {
              ...PAGE_LOG_CONTEXT,
              count: Array.isArray(freshData) ? freshData.length : 0,
            });
          },
        });
        if (cached) {
          return Array.isArray(cached) ? cached : Array.isArray(cached?.data) ? cached.data : [];
        }
      }

      if (window.UnifiedCacheManager?.get) {
        try {
          const cached = await window.UnifiedCacheManager.get(CACHE_KEY, { ttl });
          if (cached) {
            return Array.isArray(cached) ? cached : Array.isArray(cached?.data) ? cached.data : [];
          }
        } catch (error) {
          window.Logger?.warn?.('⚠️ Failed to read cache', {
            ...PAGE_LOG_CONTEXT,
            error: error?.message,
          });
        }
      }

      return await loader();
    } catch (error) {
      notifyLoadError('שגיאה בטעינת נתונים', error);
      throw error;
    }
  }

  async function sendMutation({ entityId, method, payload, signal }) {
    const endpoint = entityId ? ENDPOINTS.detail(entityId) : ENDPOINTS.list;
    try {
      const response = await fetch(buildUrl(endpoint), {
        method,
        headers: DEFAULT_HEADERS,
        body: payload ? JSON.stringify(payload) : undefined,
        signal,
      });

      if (response.ok) {
        // Determine action based on method
        if (window.CacheSyncManager?.invalidateByAction) {
          const action = method === 'POST' ? '{entity}-created' :
                        method === 'PUT' ? '{entity}-updated' :
                        method === 'DELETE' ? '{entity}-deleted' : '{entity}-updated';
          try {
            await window.CacheSyncManager.invalidateByAction(action);
          } catch (error) {
            // Fallback to direct invalidation
            await invalidateCache();
          }
        } else {
          await invalidateCache();
        }
      }

      return response;
    } catch (error) {
      window.Logger?.error?.('❌ Mutation failed', {
        ...PAGE_LOG_CONTEXT,
        entityId,
        method,
        error: error?.message,
      });
      throw error;
    }
  }

  async function createEntity(payload, options = {}) {
    return sendMutation({ method: 'POST', payload, signal: options.signal });
  }

  async function updateEntity(entityId, payload, options = {}) {
    return sendMutation({
      entityId,
      method: 'PUT',
      payload,
      signal: options.signal,
    });
  }

  async function deleteEntity(entityId, options = {}) {
    return sendMutation({
      entityId,
      method: 'DELETE',
      signal: options.signal,
    });
  }

  async function fetchEntityDetails(entityId, options = {}) {
    const response = await fetch(buildUrl(ENDPOINTS.detail(entityId)), {
      method: 'GET',
      headers: DEFAULT_HEADERS,
      signal: options.signal,
    });

    if (!response.ok) {
      const error = new Error(`טעינת פרטים נכשלה (${response.status})`);
      window.Logger?.error?.('❌ Failed to fetch details', {
        ...PAGE_LOG_CONTEXT,
        entityId,
        error: error.message,
      });
      throw error;
    }

    return response.json();
  }

  if (typeof window.CacheTTLGuard?.setConfig === 'function') {
    window.CacheTTLGuard.setConfig(CACHE_KEY, { ttl: DEFAULT_TTL });
  }

  window.{EntityName}Data = {
    KEY: CACHE_KEY,
    TTL: DEFAULT_TTL,
    loadData,
    fetchFresh: fetchFromApi,
    saveCache,
    invalidateCache,
    createEntity,
    updateEntity,
    deleteEntity,
    fetchEntityDetails,
  };

  window.Logger?.info?.('✅ {Entity Name} Data Service initialized', PAGE_LOG_CONTEXT);
})();
```

---

## 4. Development Workflow

### Creating a New Data Service

1. **Create the service file** in `trading-ui/scripts/services/{entity}-data.js`
2. **Follow the template** above, replacing placeholders:
   - `{Entity Name}` → Actual entity name (e.g., "Trades", "Executions")
   - `{entity}` → Lowercase entity name (e.g., "trades", "executions")
   - `{entityName}` → CamelCase service name (e.g., "tradesDataService")
   - `{EntityName}` → PascalCase window object name (e.g., "TradesData")
3. **Update endpoints** to match your API routes
4. **Customize normalization** if your API returns data in a different format
5. **Add the service to HTML** in the appropriate page's script section
6. **Update page script** to use the service instead of direct fetch calls

### Updating an Existing Service

1. **Check current usage** - grep for `fetch(` in the page script
2. **Replace fetch calls** with service methods
3. **Ensure CRUD operations** use the service
4. **Test cache invalidation** after CRUD operations
5. **Verify error handling** works correctly

---

## 5. Integration with Page Scripts

### Loading Data

```javascript
// In page script (e.g., trades.js)
async function loadTradesData(options = {}) {
  try {
    if (typeof window.TradesData?.loadTradesData === 'function') {
      const data = await window.TradesData.loadTradesData(options);
      // Process and display data
      updateTradesTable(data);
    } else {
      // Fallback to direct fetch (should be removed eventually)
      const response = await fetch('/api/trades/');
      const data = await response.json();
      updateTradesTable(data.data || data);
    }
  } catch (error) {
    window.Logger?.error?.('Failed to load trades', error);
    window.showErrorNotification?.('שגיאה', 'שגיאה בטעינת טריידים');
  }
}
```

### Creating/Updating Entities

```javascript
// In page script
async function saveTrade(tradeData) {
  try {
    let response;
    if (typeof window.TradesData?.createTrade === 'function') {
      response = await window.TradesData.createTrade(tradeData);
    } else {
      // Fallback
      response = await fetch('/api/trades/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeData)
      });
    }

    // Use CRUDResponseHandler for consistent response handling
    await CRUDResponseHandler.handleSaveResponse(response, {
      modalId: 'addTradeModal',
      successMessage: 'טרייד נוסף בהצלחה',
      entityName: 'טרייד',
      reloadFn: window.loadTradesData,
      requiresHardReload: false
    });
  } catch (error) {
    CRUDResponseHandler.handleError(error, 'שמירת טרייד');
  }
}
```

### Deleting Entities

```javascript
// In page script
async function deleteTrade(tradeId) {
  try {
    let response;
    if (typeof window.TradesData?.deleteTrade === 'function') {
      response = await window.TradesData.deleteTrade(tradeId);
    } else {
      // Fallback
      response = await fetch(`/api/trades/${tradeId}`, {
        method: 'DELETE'
      });
    }

    await CRUDResponseHandler.handleDeleteResponse(response, {
      successMessage: 'טרייד נמחק בהצלחה',
      entityName: 'טרייד',
      reloadFn: window.loadTradesData,
      requiresHardReload: false
    });
  } catch (error) {
    CRUDResponseHandler.handleError(error, 'מחיקת טרייד');
  }
}
```

---

## 6. Business Logic API Integration

### Overview

Every Data Service can include Business Logic API wrappers that provide:
- **Validation** - Business rule validation via backend
- **Calculations** - Complex business calculations (prices, percentages, P/L, etc.)
- **Cache Integration** - Automatic caching via CacheTTLGuard
- **Error Handling** - Standardized error handling

### Adding Business Logic API Wrappers

#### Example: Trade Validation Wrapper

```javascript
// In trades-data.js

/**
 * Validate trade data using backend business logic service.
 * Uses UnifiedCacheManager for caching results (60s TTL).
 * @param {Object} tradeData - Trade data to validate
 * @returns {Promise<Object>} Validation result: {is_valid, errors}
 */
async function validateTrade(tradeData) {
  // Use optimized cache key generation
  const cacheKey = window.CacheKeyHelper?.generateCacheKeyFromObject 
    ? window.CacheKeyHelper.generateCacheKeyFromObject('business:validate-trade', tradeData)
    : `business:validate-trade:${JSON.stringify(tradeData)}`;
  
  try {
    // Use CacheTTLGuard for automatic cache management
    if (window.CacheTTLGuard?.ensure) {
      return await window.CacheTTLGuard.ensure(cacheKey, async () => {
        const response = await fetch('/api/business/trade/validate', {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          body: JSON.stringify(tradeData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          return {
            is_valid: false,
            errors: errorData.error?.errors || [errorData.error?.message || 'Validation failed']
          };
        }

        const result = await response.json();
        return {
          is_valid: result.status === 'success',
          errors: []
        };
      }, { ttl: 60 * 1000 });
    }
    
    // Fallback if CacheTTLGuard not available
    const response = await fetch('/api/business/trade/validate', {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(tradeData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        is_valid: false,
        errors: errorData.error?.errors || [errorData.error?.message || 'Validation failed']
      };
    }

    const result = await response.json();
    return {
      is_valid: result.status === 'success',
      errors: []
    };
  } catch (error) {
    window.Logger?.error?.('❌ Error validating trade', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
    throw error;
  }
}

// Export to global scope
window.TradesData = {
  // ... existing functions ...
  validateTrade,
};
```

#### Example: Calculation Wrapper

```javascript
/**
 * Calculate stop price using backend business logic service.
 * Uses UnifiedCacheManager for caching results (30s TTL).
 * @param {number} currentPrice - Current price
 * @param {number} stopPercentage - Stop percentage
 * @param {string} side - Trade side ('Long', 'Short', 'buy', 'sell')
 * @returns {Promise<number>} Calculated stop price
 */
async function calculateStopPrice(currentPrice, stopPercentage, side = 'Long') {
  const cacheKey = `business:calculate-stop-price:${currentPrice}:${stopPercentage}:${side}`;
  
  try {
    // Use CacheTTLGuard for automatic cache management
    if (window.CacheTTLGuard?.ensure) {
      return await window.CacheTTLGuard.ensure(cacheKey, async () => {
        const response = await fetch('/api/business/trade/calculate-stop-price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            current_price: currentPrice,
            stop_percentage: stopPercentage,
            side: side
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.status === 'success' && result.data?.stop_price !== undefined) {
          return result.data.stop_price;
        } else {
          throw new Error(result.error?.message || 'Invalid calculation result');
        }
      }, { ttl: 30 * 1000 });
    }
    
    // Fallback if CacheTTLGuard not available
    const response = await fetch('/api/business/trade/calculate-stop-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_price: currentPrice,
        stop_percentage: stopPercentage,
        side: side
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.status === 'success' && result.data?.stop_price !== undefined) {
      return result.data.stop_price;
    } else {
      throw new Error(result.error?.message || 'Invalid calculation result');
    }
  } catch (error) {
    window.Logger?.error?.('❌ Error calculating stop price', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
    throw error;
  }
}
```

### Using Business Logic API Wrappers in Page Scripts

```javascript
// In trades.js

async function saveTrade(tradeData) {
  try {
    // Validate using Business Logic API
    if (window.TradesData?.validateTrade) {
      const validationResult = await window.TradesData.validateTrade(tradeData);
      
      if (!validationResult.is_valid) {
        window.showErrorNotification?.('שגיאת ולידציה', validationResult.errors.join(', '));
        return;
      }
    }
    
    // Calculate stop price using Business Logic API
    if (window.TradesData?.calculateStopPrice) {
      const stopPrice = await window.TradesData.calculateStopPrice(
        tradeData.current_price,
        tradeData.stop_percentage,
        tradeData.side
      );
      tradeData.stop_price = stopPrice;
    }
    
    // Save trade
    const response = await window.TradesData.saveTrade(tradeData);
    
    // Handle response...
  } catch (error) {
    window.Logger?.error?.('Error saving trade', { error });
    window.showErrorNotification?.('שגיאה', 'שגיאה בשמירת טרייד');
  }
}
```

### Cache Integration with Business Logic API

Business Logic API wrappers automatically use:
- **CacheTTLGuard** - For automatic TTL management
- **CacheKeyHelper** - For optimized cache key generation
- **UnifiedCacheManager** - For multi-layer caching

**TTL Guidelines:**
- **Calculations:** 30 seconds (e.g., calculateStopPrice, calculateTargetPrice)
- **Validations:** 60 seconds (e.g., validateTrade, validateExecution)

### Cache Invalidation

Business Logic API cache is automatically invalidated after mutations:

```javascript
// After creating/updating/deleting entity
if (result.status === 'success' && window.CacheSyncManager?.invalidateByAction) {
  await window.CacheSyncManager.invalidateByAction('trade-created');
  // This invalidates all related Business Logic API cache
}
```

### Related Documentation

- [Business Logic Layer Documentation](../../02-ARCHITECTURE/BACKEND/BUSINESS_LOGIC_LAYER.md)
- [Business Logic Developer Guide](BUSINESS_LOGIC_DEVELOPER_GUIDE.md)
- [Business Rules Registry](../../02-ARCHITECTURE/BACKEND/BUSINESS_RULES_REGISTRY.md)

---

## 7. Best Practices

### Caching

- **Always use UnifiedCacheManager** for saving/loading data
- **Use CacheTTLGuard** for automatic TTL management
- **Use CacheSyncManager.invalidateByAction** for cache invalidation after CRUD operations
- **Set appropriate TTL** based on data volatility (30-90 seconds for most entities)

### Error Handling

- **Always use Logger Service** for logging errors
- **Show user-friendly notifications** via `window.showErrorNotification`
- **Provide fallback behavior** when services are unavailable
- **Log detailed error context** for debugging

### Code Organization

- **Follow the template** exactly - consistency is key
- **Use IIFE pattern** to avoid global namespace pollution
- **Export service via window object** with PascalCase name
- **Document all functions** with JSDoc comments

### Integration

- **Always use CRUDResponseHandler** for CRUD operations
- **Provide reloadFn** to CRUDResponseHandler for automatic table refresh
- **Never call fetch directly** in page scripts - always use services
- **Maintain fallback behavior** during migration period

---

## 8. Troubleshooting

### Service Not Loading

**Problem:** `window.{EntityName}Data` is undefined

**Solutions:**
1. Check that service file is loaded in HTML before page script
2. Verify service file syntax is correct
3. Check browser console for JavaScript errors
4. Ensure service is wrapped in IIFE and exports to window

### Cache Not Working

**Problem:** Data always loads from API, never from cache

**Solutions:**
1. Verify UnifiedCacheManager is initialized
2. Check CacheTTLGuard is available
3. Ensure TTL is set correctly
4. Verify cache key is consistent

### Cache Not Invalidating

**Problem:** Changes don't appear until manual refresh

**Solutions:**
1. Verify CacheSyncManager.invalidateByAction is called after mutations
2. Check action names match CACHE_SYNC_INTEGRATION_MAP.md
3. Ensure dependencies are configured correctly
4. Check browser console for invalidation errors

### CRUD Operations Failing

**Problem:** Create/Update/Delete operations don't work

**Solutions:**
1. Verify service methods return Response objects (not JSON)
2. Check CRUDResponseHandler is used correctly
3. Ensure error handling catches and displays errors
4. Verify API endpoints are correct

---

## 9. Validation Integration

### סקירה כללית

כל Data Service יכול לכלול wrappers ל-Business Logic API עבור ולידציה. ה-wrappers משתמשים ב-ValidationService (Database Constraints) ו-BusinessRulesRegistry (Business Rules) כדי לספק ולידציה מקיפה.

### ארכיטקטורת ולידציה:

**3 שכבות ולידציה:**

1. **Database Constraints** (ValidationService) - אילוצים בסיסיים מבסיס הנתונים
2. **Business Rules** (BusinessRulesRegistry) - חוקי עסק מורכבים
3. **Frontend Validation** - ולידציה בלקוח (UX)

### דוגמה: הוספת Validation Wrapper

```javascript
/**
 * Validate {entity} data using backend business logic service.
 * Uses UnifiedCacheManager for caching results (60s TTL).
 * @param {Object} {entity}Data - {Entity} data to validate
 * @returns {Promise<Object>} Validation result: {is_valid, errors}
 */
async function validate{Entity}({entity}Data) {
    const cacheKey = window.CacheKeyHelper?.generateCacheKeyFromObject
      ? window.CacheKeyHelper.generateCacheKeyFromObject('business:validate-{entity}', {entity}Data)
      : `business:validate-{entity}:${JSON.stringify({entity}Data)}`;
    
    try {
        // Use CacheTTLGuard for automatic cache management
        if (window.CacheTTLGuard?.ensure) {
            return await window.CacheTTLGuard.ensure(cacheKey, async () => {
                const response = await fetch('/api/business/{entity}/validate', {
                    method: 'POST',
                    headers: DEFAULT_HEADERS,
                    body: JSON.stringify({entity}Data)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    return {
                        is_valid: false,
                        errors: errorData.error?.errors || [errorData.error?.message || 'Validation failed']
                    };
                }

                const result = await response.json();
                return {
                    is_valid: result.status === 'success',
                    errors: []
                };
            }, { ttl: 60 * 1000 });
        }
        
        // Fallback if CacheTTLGuard not available
        const response = await fetch('/api/business/{entity}/validate', {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify({entity}Data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                is_valid: false,
                errors: errorData.error?.errors || [errorData.error?.message || 'Validation failed']
            };
        }

        const result = await response.json();
        return {
            is_valid: result.status === 'success',
            errors: []
        };
    } catch (error) {
        window.Logger?.error?.('❌ Error validating {entity}', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
        return {
            is_valid: false,
            errors: [error?.message || 'Validation failed']
        };
    }
}

// Export to window
window.{Entity}Data = {
    // ... other functions ...
    validate{Entity}
};
```

### שימוש ב-Validation Wrapper:

```javascript
// In page script
const validationResult = await window.{Entity}Data.validate{Entity}({
    field1: 'value1',
    field2: 'value2'
});

if (!validationResult.is_valid) {
    window.NotificationSystem.showError('Validation failed', {
        details: validationResult.errors.join(', ')
    });
    return;
}

// Continue with save/update operation
```

### Validation Order (Backend):

בביצוע, ה-Business Service בודק לפי הסדר הבא:

1. **Database Constraints** (ValidationService) - דרך `validate_with_constraints()`
2. **Business Rules Registry** - דרך `registry.validate_value()`
3. **Complex Business Rules** - לוגיקה עסקית מורכבת

**ראה:** [BUSINESS_LOGIC_LAYER.md](../../02-ARCHITECTURE/BACKEND/BUSINESS_LOGIC_LAYER.md#validation-architecture) לפרטים מלאים

---

## 10. Related Documentation

- [CRUD Response Handler](../02-ARCHITECTURE/FRONTEND/CRUD_RESPONSE_HANDLER.md) - Standardized CRUD response handling
- [Cache Implementation Guide](../02-ARCHITECTURE/FRONTEND/CACHE_IMPLEMENTATION_GUIDE.md) - Unified caching system
- [General Systems List](../../frontend/GENERAL_SYSTEMS_LIST.md) - Complete list of all general systems
- [User Pages Standardization Summary](../../reports/user-pages-standardization/USER_PAGES_STANDARDIZATION_SUMMARY.md) - Standardization status

---

## 11. Examples

### Complete Service Example

See `trading-ui/scripts/services/trades-data.js` for a complete, production-ready example.

### Page Integration Example

See `trading-ui/scripts/trades.js` for how to integrate a data service in a page script.

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Author:** TikTrack Development Team

