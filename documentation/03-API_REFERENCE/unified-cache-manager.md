# Unified Cache Manager - API Reference

## Overview
מנהל מטמון מרכזי לכל שכבות המטמון במערכת TikTrack עם 4 שכבות מטמון וסינכרון אוטומטי.

## Cache Layers
1. **Frontend Memory** - נתונים זמניים (<100KB)
2. **localStorage** - נתונים פשוטים (<1MB)  
3. **IndexedDB** - נתונים מורכבים (>1MB)
4. **Backend Cache** - נתונים קריטיים עם TTL

## Core API Functions

### `clearAllCache(options)`
ניקוי מלא של כל שכבות המטמון

**Parameters:**
- `options` (object, optional) - אפשרויות ניקוי
  - `layers` (array, optional) - שכבות ספציפיות לניקוי
  - `force` (boolean, optional) - כפיית ניקוי גם אם יש שגיאות

**Returns:** `Promise<void>`

**Example:**
```javascript
// Clear all layers
await window.UnifiedCacheManager.clearAllCache();

// Clear specific layers
await window.UnifiedCacheManager.clearAllCache({
  layers: ['memory', 'localStorage']
});
```

### `clearAllCacheQuick()`
ניקוי מהיר לפיתוח עם auto-refresh

**Returns:** `Promise<void>`

**Features:**
- ניקוי כל השכבות
- Auto-refresh אחרי 1.5 שניות
- הצגת התראות התקדמות

**Example:**
```javascript
// Quick development refresh
await window.UnifiedCacheManager.clearAllCacheQuick();
```

### `clearAllCacheDetailed()`
ניקוי מפורט עם logging מלא

**Returns:** `Promise<void>`

**Features:**
- ניקוי כל השכבות
- Detailed logging לכל שכבה
- הצגת התראות התקדמות מפורטות

**Example:**
```javascript
// Detailed debug clearing
await window.UnifiedCacheManager.clearAllCacheDetailed();
```

### `refreshUserPreferences()`
ניקוי ממוקד להעדפות בלבד

**Returns:** `Promise<void>`

**Features:**
- מוחק רק מפתחות העדפות: `preference_*`, `all_preferences_*`, `user-preferences`
- טוען מחדש העדפות מהשרת
- לא משפיע על שאר המטמון

**Example:**
```javascript
// Refresh only preferences
await window.UnifiedCacheManager.refreshUserPreferences();
```

## Layer-Specific Functions

### `clearCacheLayer(layer)`
ניקוי שכבה ספציפית

**Parameters:**
- `layer` (string) - שם השכבה: `memory`, `localStorage`, `indexedDB`, `backend`

**Returns:** `Promise<void>`

**Example:**
```javascript
// Clear only localStorage
await window.UnifiedCacheManager.clearCacheLayer('localStorage');

// Clear only IndexedDB
await window.UnifiedCacheManager.clearCacheLayer('indexedDB');
```

## Cache Management Functions

### `get(key, options)`
קבלת ערך מהמטמון

**Parameters:**
- `key` (string) - מפתח המטמון
- `options` (object, optional) - אפשרויות
  - `layer` (string, optional) - שכבה ספציפית
  - `fallback` (any, optional) - ערך ברירת מחדל

**Returns:** `any` - הערך או null אם לא נמצא

**Example:**
```javascript
// Get from cache
const data = window.UnifiedCacheManager.get('trades_data');

// Get with fallback
const data = window.UnifiedCacheManager.get('trades_data', {
  fallback: []
});
```

### `set(key, value, options)`
שמירת ערך במטמון

**Parameters:**
- `key` (string) - מפתח המטמון
- `value` (any) - הערך לשמירה
- `options` (object, optional) - אפשרויות
  - `layer` (string, optional) - שכבה ספציפית
  - `ttl` (number, optional) - זמן חיים בשניות

**Returns:** `Promise<boolean>` - true אם נשמר בהצלחה

**Example:**
```javascript
// Save to cache
await window.UnifiedCacheManager.set('trades_data', data);

// Save with TTL
await window.UnifiedCacheManager.set('trades_data', data, {
  ttl: 3600 // 1 hour
});
```

### `has(key, options)`
בדיקה אם מפתח קיים במטמון

**Parameters:**
- `key` (string) - מפתח לבדיקה
- `options` (object, optional) - אפשרויות
  - `layer` (string, optional) - שכבה ספציפית

**Returns:** `boolean` - true אם המפתח קיים

**Example:**
```javascript
// Check if key exists
const exists = window.UnifiedCacheManager.has('trades_data');

// Check in specific layer
const exists = window.UnifiedCacheManager.has('trades_data', {
  layer: 'localStorage'
});
```

### `delete(key, options)`
מחיקת מפתח מהמטמון

**Parameters:**
- `key` (string) - מפתח למחיקה
- `options` (object, optional) - אפשרויות
  - `layer` (string, optional) - שכבה ספציפית

**Returns:** `Promise<boolean>` - true אם נמחק בהצלחה

**Example:**
```javascript
// Delete key
await window.UnifiedCacheManager.delete('trades_data');

// Delete from specific layer
await window.UnifiedCacheManager.delete('trades_data', {
  layer: 'localStorage'
});
```

## Cache Statistics

### `getCacheStats()`
קבלת סטטיסטיקות מטמון

**Returns:** `object` - סטטיסטיקות מטמון

**Example:**
```javascript
const stats = window.UnifiedCacheManager.getCacheStats();
console.log('Cache size:', stats.totalSize);
console.log('Keys count:', stats.keysCount);
```

### `getLayerStats(layer)`
קבלת סטטיסטיקות שכבה ספציפית

**Parameters:**
- `layer` (string) - שם השכבה

**Returns:** `object` - סטטיסטיקות השכבה

**Example:**
```javascript
const stats = window.UnifiedCacheManager.getLayerStats('localStorage');
console.log('localStorage size:', stats.size);
console.log('localStorage keys:', stats.keys);
```

## Cache Clearing Hierarchy

### 1. Full System Reset
```javascript
// Complete cache clearing
await window.UnifiedCacheManager.clearAllCache();
```

### 2. Development Refresh
```javascript
// Quick development refresh
await window.UnifiedCacheManager.clearAllCacheQuick();
```

### 3. Profile Switch
```javascript
// Refresh only preferences
await window.UnifiedCacheManager.refreshUserPreferences();
```

### 4. Debug Mode
```javascript
// Detailed debug clearing
await window.UnifiedCacheManager.clearAllCacheDetailed();
```

## Usage Examples

### Basic Cache Operations
```javascript
// Save data
await window.UnifiedCacheManager.set('user_data', userData);

// Get data
const userData = window.UnifiedCacheManager.get('user_data');

// Check if exists
if (window.UnifiedCacheManager.has('user_data')) {
  // Use cached data
}
```

### Layer-Specific Operations
```javascript
// Save to specific layer
await window.UnifiedCacheManager.set('large_data', data, {
  layer: 'indexedDB'
});

// Get from specific layer
const data = window.UnifiedCacheManager.get('large_data', {
  layer: 'indexedDB'
});
```

### Cache Clearing Patterns
```javascript
// Development workflow
async function refreshData() {
  // Clear cache
  await window.UnifiedCacheManager.clearAllCacheQuick();
  
  // Reload data
  await loadDataFromServer();
}

// User preference changes
async function updatePreferences() {
  // Clear only preferences
  await window.UnifiedCacheManager.refreshUserPreferences();
  
  // Reload preferences
  await loadPreferences();
}
```

## Best Practices

1. **Use appropriate layers:**
   - `memory` - נתונים זמניים
   - `localStorage` - נתונים פשוטים
   - `indexedDB` - נתונים מורכבים
   - `backend` - נתונים קריטיים

2. **Handle cache misses:**
   ```javascript
   let data = window.UnifiedCacheManager.get('key');
   if (!data) {
     data = await fetchFromServer();
     await window.UnifiedCacheManager.set('key', data);
   }
   ```

3. **Use TTL for time-sensitive data:**
   ```javascript
   await window.UnifiedCacheManager.set('quotes', quotes, {
     ttl: 300 // 5 minutes
   });
   ```

4. **Clear cache appropriately:**
   - Development: `clearAllCacheQuick()`
   - Production: `clearAllCache()`
   - Preferences only: `refreshUserPreferences()`

## Dependencies
- Logger Service (for detailed logging)
- Notification System (for progress notifications)

## File Location
`trading-ui/scripts/unified-cache-manager.js`

## Version
2.0 (Last updated: January 2025)
