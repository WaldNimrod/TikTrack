# Data Services Architecture - TikTrack

## Overview

The Data Services architecture provides a unified, standardized layer for all API interactions in TikTrack. Each entity has a dedicated data service that encapsulates API calls, caching, error handling, and cache invalidation.

---

## Architecture Principles

### 1. Separation of Concerns

- **Data Services Layer**: Handles all API communication, caching, and data normalization
- **Page Scripts Layer**: Handles UI logic, form handling, and user interactions
- **General Systems Layer**: Provides shared utilities (CRUDResponseHandler, UnifiedCacheManager, etc.)

### 2. Unified Interface

All data services follow the same interface pattern:

```javascript
window.{EntityName}Data = {
  KEY: 'cache-key',
  TTL: 60000,
  loadData: async (options) => {...},
  fetchFresh: async (options) => {...},
  saveCache: async (data, options) => {...},
  invalidateCache: async () => {...},
  createEntity: async (payload, options) => {...},
  updateEntity: async (id, payload, options) => {...},
  deleteEntity: async (id, options) => {...},
  fetchEntityDetails: async (id, options) => {...},
};
```

### 3. Cache-First Strategy

All data services implement a cache-first strategy:

1. Check cache (via CacheTTLGuard or UnifiedCacheManager)
2. If cache hit and valid → return cached data
3. If cache miss or expired → fetch from API
4. Save to cache after successful fetch
5. Return normalized data

---

## System Components

### Data Service Layer

```
trading-ui/scripts/services/
├── trades-data.js          # Trades entity
├── executions-data.js       # Executions entity
├── cash-flows-data.js       # Cash flows entity
├── notes-data.js            # Notes entity
├── trading-accounts-data.js # Trading accounts entity
├── data-import-data.js     # Data import operations
├── research-data.js         # Research dashboard
└── preferences-data.js      # User preferences
```

### Cache Layer

```
trading-ui/scripts/
├── unified-cache-manager.js  # Multi-layer cache (Memory/LocalStorage/IndexedDB/Backend)
├── cache-ttl-guard.js        # TTL management and cache validation
└── cache-sync-manager.js    # Cache invalidation and synchronization
```

### CRUD Layer

```
trading-ui/scripts/services/
└── crud-response-handler.js  # Standardized CRUD response handling
```

---

## Data Flow

### Loading Data

```
Page Script
    ↓
Data Service.loadData()
    ↓
CacheTTLGuard.ensure() or UnifiedCacheManager.get()
    ↓
[Cache Hit?] → Yes → Return Cached Data
    ↓ No
Fetch from API
    ↓
Normalize Payload
    ↓
Save to Cache (UnifiedCacheManager.save())
    ↓
Return Normalized Data
```

### Creating/Updating/Deleting

```
Page Script
    ↓
Data Service.createEntity() / updateEntity() / deleteEntity()
    ↓
Send Mutation Request (POST/PUT/DELETE)
    ↓
[Response OK?] → Yes → CacheSyncManager.invalidateByAction()
    ↓
Return Response Object
    ↓
CRUDResponseHandler.handleSaveResponse() / handleUpdateResponse() / handleDeleteResponse()
    ↓
Show Notification
    ↓
Reload Table (via reloadFn)
```

---

## Design Patterns

### 1. IIFE Pattern

All data services use Immediately Invoked Function Expressions (IIFE) to avoid global namespace pollution:

```javascript
(function entityDataService() {
  // Service implementation
  window.EntityData = { ... };
})();
```

### 2. Factory Pattern

Services expose factory functions for creating/updating/deleting:

```javascript
async function sendMutation({ entityId, method, payload, signal }) {
  // Generic mutation handler
}

async function createEntity(payload, options) {
  return sendMutation({ method: 'POST', payload, ...options });
}
```

### 3. Strategy Pattern

Cache invalidation uses strategy pattern:

```javascript
// Try CacheSyncManager first (preferred)
if (window.CacheSyncManager?.invalidateByAction) {
  await window.CacheSyncManager.invalidateByAction(action);
} else {
  // Fallback to direct invalidation
  await window.UnifiedCacheManager.invalidate(CACHE_KEY);
}
```

---

## Integration with Other Systems

### UnifiedCacheManager

- **Purpose**: Multi-layer caching (Memory → LocalStorage → IndexedDB → Backend)
- **Usage**: All data services use UnifiedCacheManager for saving/loading data
- **TTL**: Configured per service (typically 30-90 seconds)

### CacheTTLGuard

- **Purpose**: Automatic TTL validation and cache refresh
- **Usage**: Wraps data loading to ensure cache freshness
- **Benefits**: Reduces API calls while maintaining data freshness

### CacheSyncManager

- **Purpose**: Coordinated cache invalidation across frontend and backend
- **Usage**: Invalidates cache after CRUD operations using action-based dependencies
- **Actions**: `{entity}-created`, `{entity}-updated`, `{entity}-deleted`

### CRUDResponseHandler

- **Purpose**: Standardized handling of CRUD responses
- **Usage**: All page scripts use CRUDResponseHandler for consistent error handling and UI updates
- **Features**: Automatic modal closing, notifications, table refresh

---

## Error Handling

### Standardized Error Flow

1. **API Error**: Caught in service method
2. **Logging**: Error logged via Logger Service with context
3. **Notification**: User-friendly error notification displayed
4. **Fallback**: Service may provide fallback behavior if available

### Error Notification Pattern

```javascript
function notifyLoadError(message, error) {
  const details = error?.message || message || 'שגיאה בטעינת נתונים';
  window.Logger?.error?.('❌ Load failed', {
    ...PAGE_LOG_CONTEXT,
    error: details,
  });
  window.showErrorNotification?.('שגיאה', `${details} – הנתונים לא זמינים כרגע`);
}
```

---

## Data Normalization

All services normalize API responses to a consistent format:

```javascript
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
```

This ensures:
- Consistent data structure across all services
- Handling of different API response formats
- Filtering of invalid records

---

## Performance Considerations

### Caching Strategy

- **TTL Configuration**: Based on data volatility
  - High volatility (trades, executions): 30-45 seconds
  - Medium volatility (cash flows, notes): 60 seconds
  - Low volatility (preferences, accounts): 60-90 seconds

### Cache Invalidation

- **Action-Based**: Uses CacheSyncManager.invalidateByAction for coordinated invalidation
- **Dependencies**: Configured in CACHE_SYNC_INTEGRATION_MAP.md
- **Fallback**: Direct invalidation if CacheSyncManager unavailable

### Request Deduplication

- **CacheTTLGuard**: Prevents duplicate requests for same data
- **In-Flight Requests**: Services may implement request deduplication

---

## Security Considerations

### API Base URL Resolution

All services resolve base URL safely:

```javascript
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
```

### Input Validation

- Services normalize and validate input data
- Invalid records are filtered out
- Errors are logged with context

---

## Testing Strategy

### Unit Tests

- Test each service method independently
- Mock UnifiedCacheManager, CacheTTLGuard, and CacheSyncManager
- Verify error handling and normalization

### Integration Tests

- Test service integration with cache systems
- Test CRUD operations end-to-end
- Verify cache invalidation after mutations

### E2E Tests

- Test complete user flows
- Verify data loading and display
- Test CRUD operations in real browser environment

---

## Migration Guide

### From Direct Fetch to Data Service

1. **Identify fetch calls**: Search for `fetch('/api/{entity}/'` in page script
2. **Create/Update service**: Ensure service has required methods
3. **Replace fetch calls**: Use service methods instead
4. **Update error handling**: Use CRUDResponseHandler for CRUD operations
5. **Test thoroughly**: Verify all functionality works correctly

### Example Migration

**Before:**
```javascript
const response = await fetch('/api/trades/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(tradeData)
});
```

**After:**
```javascript
const response = await window.TradesData.createTrade(tradeData);
await CRUDResponseHandler.handleSaveResponse(response, {
  modalId: 'addTradeModal',
  successMessage: 'טרייד נוסף בהצלחה',
  entityName: 'טרייד',
  reloadFn: window.loadTradesData
});
```

---

## Related Documentation

- [Data Services Developer Guide](../../03-DEVELOPMENT/GUIDES/DATA_SERVICES_DEVELOPER_GUIDE.md) - Complete developer guide
- [CRUD Response Handler](CRUD_RESPONSE_HANDLER.md) - CRUD response handling
- [Cache Implementation Guide](CACHE_IMPLEMENTATION_GUIDE.md) - Caching system details
- [General Systems List](../../frontend/GENERAL_SYSTEMS_LIST.md) - Complete systems list

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Author:** TikTrack Development Team

