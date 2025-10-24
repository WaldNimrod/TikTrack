# Cache Standards - TikTrack

> **גרסה 1.0** - סטנדרטים אחידים למערכת המטמון

---

## 📋 Standard Cache Key Formats

### Preferences
- **Single preference:** `preference_{name}_{userId}_{profileId}`
- **All preferences:** `all_preferences_{userId}_{profileId}`
- **User preferences:** `user-preferences`

### UI State
- **Filter state:** `filter-state`
- **UI state:** `ui-state`
- **Page state:** `page-state-{pageName}`

### Data
- **Market data:** `market-data`
- **Trade data:** `trade-data`
- **Dashboard data:** `dashboard-data`

---

## 🧹 Cache Clearing Standards

### Preference-specific clearing
Clear only: `preference_*`, `all_preferences_*`, `user-preferences`

### Profile switch clearing
Clear: All preference keys for old profile

### Full clearing
Clear: All layers (memory, localStorage, IndexedDB, backend)

---

## 🏗️ Cache Layer Assignment

### Memory Layer
- **Temporary data** (<100KB)
- **TTL:** Until page reload
- **Examples:** UI state during session

### localStorage Layer
- **Simple data** (<1MB)
- **TTL:** 1 hour (default) or null for persistent
- **Examples:** User preferences, filter state

### IndexedDB Layer
- **Complex data** (>1MB)
- **TTL:** 24 hours (default)
- **Examples:** Notifications history, file mappings

### Backend Cache Layer
- **Critical data** with short TTL
- **TTL:** 30 seconds - 5 minutes
- **Examples:** Market data, trade data

---

## 🔧 Pattern Matching

### Wildcard Support
- `preference_*` - All individual preferences
- `all_preferences_*` - All preference collections
- `user-preferences` - General user preferences key

### Usage
```javascript
// Get policy for key with pattern matching
const policy = window.UnifiedCacheManager.getKeyPolicy('preference_primaryColor_1_2');
// Returns: { layer: 'localStorage', ttl: 300000, compress: false }
```

---

## 📊 Cache Performance Standards

### TTL Guidelines
- **Critical data:** 30 seconds - 5 minutes
- **User preferences:** 5 minutes
- **UI state:** 1 hour
- **Historical data:** 24 hours
- **Persistent data:** null (no expiration)

### Size Limits
- **Memory layer:** <100KB per entry
- **localStorage:** <1MB per entry
- **IndexedDB:** No limit (but monitor performance)
- **Backend cache:** <10MB per entry

---

## 🚨 Error Handling Standards

### Cache Miss Handling
1. Check all layers in order
2. If not found, use fallback function
3. Save result to appropriate layer
4. Return data to caller

### Cache Clear Failures
1. Log error with context
2. Continue with partial clearing
3. Notify user of issues
4. Retry failed operations

---

## 🔍 Debugging Standards

### Console Commands
- `debugPreferencesCache()` - Show cache state
- `debugProfileSwitch()` - Verify profile switching
- `debugPreferenceCache("preferenceName")` - Check specific preference

### Cache Management Page
- Navigate to `/cache-management.html`
- Use Light/Medium/Full/Nuclear clearing options
- View cache statistics and health

---

## 📚 Best Practices

### 1. Always use UnifiedCacheManager
```javascript
// ✅ Correct
await window.UnifiedCacheManager.save(key, data, options);

// ❌ Avoid
localStorage.setItem(key, JSON.stringify(data));
```

### 2. Follow standard key formats
```javascript
// ✅ Correct
const key = `preference_${name}_${userId}_${profileId}`;

// ❌ Avoid
const key = `user_pref_${name}`;
```

### 3. Set appropriate TTL
```javascript
// ✅ Correct
const options = { ttl: 300000 }; // 5 minutes

// ❌ Avoid
const options = { ttl: null }; // For temporary data
```

### 4. Clear cache after data changes
```javascript
// ✅ Correct
await savePreference(name, value);
await window.UnifiedCacheManager.remove(cacheKey);

// ❌ Avoid
await savePreference(name, value);
// Cache not cleared - stale data
```

### 5. Test profile switching thoroughly
- Switch between all profiles
- Verify data consistency
- Check cache invalidation
- Test UI updates

---

## 🎯 Success Criteria

### Functional Requirements
1. Profile switching works immediately and persistently
2. Preference changes reflect in all systems
3. No code duplications exist
4. Clear standard for cache keys
5. All cache clearing buttons connected correctly

### Technical Requirements
1. All 28 pages work with cache
2. All 99 systems work with cache
3. Documentation updated and accurate
4. Git backup for each important stage
5. Developer guide updated

### Performance Requirements
1. Page load time not increased
2. Cache reduces server calls
3. No memory leaks created
4. System stable after 1 hour of use

---

## 📖 Related Documentation

- **[Unified Cache System](UNIFIED_CACHE_SYSTEM.md)** - Complete system specification
- **[Preferences System](preferences/PREFERENCES_SYSTEM.md)** - Preferences integration
- **[Cache Integration](preferences/PREFERENCES_CACHE_INTEGRATION.md)** - Detailed integration guide
- **[Troubleshooting Guide](CACHE_TROUBLESHOOTING.md)** - Common issues and solutions

---

*Last updated: 24/10/2025*
