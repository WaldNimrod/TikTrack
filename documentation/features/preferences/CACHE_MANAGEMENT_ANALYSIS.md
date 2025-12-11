# ניתוח ניהול מטמון העדפות - שלב 1.3

## מטרת המסמך

תיעוד מלא של כל שכבות המטמון (memory, localStorage, IndexedDB), זיהוי נקודות כניסה מרובות למטמון, מיפוי invalidation patterns, וזיהוי race conditions אפשריים.

## שכבות מטמון קיימות

### 1. Memory Cache

**מיקום:** `trading-ui/scripts/unified-cache-manager.js`

**תיאור:** מטמון בזיכרון (Map/object)

**שימוש:**

- מהיר ביותר
- נמחק ב-refresh
- לא נשמר בין sessions

**דוגמאות:**

```javascript
// UnifiedCacheManager.layers.memory
this.layers.memory = new Map();
```

### 2. localStorage

**מיקום:** `trading-ui/scripts/unified-cache-manager.js`

**תיאור:** מטמון בדפדפן (persistent)

**שימוש:**

- נשמר בין sessions
- מוגבל ל-5-10MB
- נמחק ידנית או ב-TTL

**דוגמאות:**

```javascript
// UnifiedCacheManager.layers.localStorage
localStorage.setItem(key, JSON.stringify(value));
localStorage.getItem(key);
localStorage.removeItem(key);
```

### 3. IndexedDB

**מיקום:** `trading-ui/scripts/unified-cache-manager.js`

**תיאור:** מטמון מתקדם בדפדפן (persistent, גדול)

**שימוש:**

- נשמר בין sessions
- יכול להיות גדול מאוד
- async API

**דוגמאות:**

```javascript
// UnifiedCacheManager.layers.indexedDB
await this.layers.indexedDB.put(key, value);
await this.layers.indexedDB.get(key);
await this.layers.indexedDB.delete(key);
```

### 4. Backend Cache (Server-side)

**מיקום:** Backend

**תיאור:** מטמון בשרת

**שימוש:**

- ETag/304 responses
- Server-side caching

## נקודות כניסה למטמון

### 1. UnifiedCacheManager

**קובץ:** `trading-ui/scripts/unified-cache-manager.js`

**פונקציות:**

- `get(key, options)` - קריאה מכל השכבות
- `set(key, value, options)` - שמירה לכל השכבות
- `save(key, value, options)` - alias ל-set
- `remove(key)` - מחיקה מכל השכבות
- `refreshUserPreferences()` - רענון מטמון העדפות

**תהליך קריאה:**

```
get(key)
  ↓
memory.get(key) - אם יש, החזר
  ↓
localStorage.getItem(key) - אם יש, החזר + שמור ב-memory
  ↓
IndexedDB.get(key) - אם יש, החזר + שמור ב-memory + localStorage
  ↓
API call - אם אין, טען מהשרת + שמור בכל השכבות
```

**תהליך שמירה:**

```
set(key, value)
  ↓
memory.set(key, value)
  ↓
localStorage.setItem(key, value)
  ↓
IndexedDB.put(key, value)
```

### 2. PreferencesCore.loadGroupPreferences()

**קובץ:** `trading-ui/scripts/preferences-core-new.js`

**מיקום:** שורות 939-1003

**תהליך:**

```javascript
async loadGroupPreferences(groupName, userId, profileId, forceRefresh = false) {
  const cacheKey = `preference_group_${groupName}_${userId}_${profileId}`;

  // אם forceRefresh, נקה מטמון
  if (forceRefresh) {
    await UnifiedCacheManager.remove(cacheKey);
  }

  // בדוק מטמון
  if (!forceRefresh && UnifiedCacheManager) {
    const cached = await UnifiedCacheManager.get(cacheKey, {
      layer: 'localStorage',
      ttl: 300000, // 5 דקות
    });
    if (cached !== null) {
      return cached; // Cache hit
    }
  }

  // טען מהשרת
  const groupResponse = await this.apiClient.getGroupPreferences(...);
  const preferences = groupResponse.preferences || {};

  // שמור במטמון
  if (UnifiedCacheManager) {
    await UnifiedCacheManager.save(cacheKey, preferences, {
      layer: 'localStorage',
      ttl: 300000,
    });
  }

  return preferences;
}
```

**Cache Key Format:** `preference_group_{groupName}_{userId}_{profileId}`

### 3. PreferencesData.loadAllPreferencesRaw()

**קובץ:** `trading-ui/scripts/services/preferences-data.js`

**מיקום:** שורות 691-863

**תהליך:**

```javascript
async loadAllPreferencesRaw({ userId, profileId, force, ttl } = {}) {
  const cacheKey = buildCacheKey(KEY_PREFIXES.all, [
    `u${userId}`,
    `p${profileId ?? 'active'}`,
  ]);

  // נסה מטמון memory
  if (UnifiedCacheManager?.layers?.memory) {
    cached = await readCache(cacheKey, { ttl, layer: 'memory' });
  }

  // נסה localStorage
  if (!cached && UnifiedCacheManager?.layers?.localStorage) {
    cached = await readCache(cacheKey, { ttl, layer: 'localStorage' });
  }

  // נסה IndexedDB
  if (!cached && UnifiedCacheManager?.layers?.indexedDB) {
    cached = await readCache(cacheKey, { ttl, layer: 'indexedDB' });
  }

  // אם אין במטמון, טען מהשרת
  if (!cached || force) {
    const response = await fetch('/api/preferences/user/all', {...});
    const data = await response.json();
    
    // שמור בכל השכבות
    await writeCache(cacheKey, data.preferences, { ttl });
  }

  return cached || data.preferences;
}
```

**Cache Key Format:** `preferences_all_u{userId}_p{profileId}`

### 4. PreferencesData - Cache Keys

**פורמטים שונים:**

- `preference_{name}_{userId}_{profileId}` - העדפה בודדת
- `preference_group_{groupName}_{userId}_{profileId}` - קבוצת העדפות
- `preferences_all_u{userId}_p{profileId}` - כל ההעדפות
- `tiktrack_preference_...` - עם prefix

**בעיה:** פורמטים לא עקביים!

## Invalidation Patterns

### 1. refreshUserPreferences()

**מיקום:** `unified-cache-manager.js:3200-3330`

**תהליך:**

```javascript
async refreshUserPreferences(profileId, groupName, opts = {}) {
  // 1. זיהוי מפתחות להסרה
  const keysToRemove = new Set();
  // ... זיהוי מפתחות ...

  // 2. הסרה מכל השכבות
  for (const key of keysToRemove) {
    await this.remove(key); // memory + localStorage + IndexedDB
  }

  // 3. טעינה מחדש מהשרת (מיותר!)
  if (shouldReload) {
    await PreferencesGroupManager.loadGroupData(...); // ⚠️
  }
}
```

**בעיות:**

- טעינה מחדש מהשרת אחרי ניקוי מטמון (מיותר!)
- לא ברור מתי צריך לטעון מחדש

### 2. clearGroupCache()

**מיקום:** `preferences-core-new.js:1033-1043`

**תהליך:**

```javascript
async clearGroupCache(groupName, userId, profileId) {
  const cacheKey = `preference_group_${groupName}_${userId}_${profileId}`;
  await UnifiedCacheManager.remove(cacheKey);
}
```

**בעיות:**

- רק מנקה מטמון, לא מעדכן UI
- לא מנקה מטמון של כל ההעדפות

### 3. CacheSyncManager.invalidateByAction()

**מיקום:** `services/preferences-data.js:1018-1029`

**תהליך:**

```javascript
if (CacheSyncManager?.invalidateByAction) {
  await CacheSyncManager.invalidateByAction('preference-updated');
} else {
  // Fallback: direct cache clearing
  await clearCachePattern(KEY_PREFIXES.single);
  await clearCachePattern(KEY_PREFIXES.all);
}
```

**בעיות:**

- שתי דרכים שונות לניקוי מטמון
- לא ברור מתי להשתמש באיזו

## Race Conditions אפשריים

### Race Condition 1: Concurrent Loads

**תרחיש:**

1. Thread A: `loadGroupPreferences('trading_settings')` - אין במטמון, מתחיל API call
2. Thread B: `loadGroupPreferences('trading_settings')` - אין במטמון, מתחיל API call
3. שני API calls רצים במקביל
4. שני התוצאות נשמרות במטמון (כפילות!)

**פתרון נוכחי:** `functionInflight` deduplication ב-`preferences-data.js`

**בעיה:** לא עובד בכל המקומות

### Race Condition 2: Save + Load

**תרחיש:**

1. Thread A: `saveGroup()` - שומר העדפות
2. Thread A: `refreshUserPreferences()` - מנקה מטמון
3. Thread B: `loadGroupPreferences()` - אין במטמון, טוען מהשרת
4. Thread A: `refreshGroupState()` - טוען מהשרת (שוב!)
5. שתי טעינות במקביל

**פתרון נוכחי:** אין

### Race Condition 3: Cache Invalidation + Read

**תרחיש:**

1. Thread A: `remove(cacheKey)` - מוחק מטמון
2. Thread B: `get(cacheKey)` - קורא מטמון (עדיין יש!)
3. Thread A: `set(cacheKey, newValue)` - שומר ערך חדש
4. Thread B: מקבל ערך ישן

**פתרון נוכחי:** אין

## Cache Keys לא עקביים

### פורמט 1: `preference_{name}_{userId}_{profileId}`

**מיקום:** preferences-core-new.js

### פורמט 2: `preference_group_{groupName}_{userId}_{profileId}`

**מיקום:** preferences-core-new.js

### פורמט 3: `preferences_all_u{userId}_p{profileId}`

**מיקום:** preferences-data.js

### פורמט 4: `tiktrack_preference_...`

**מיקום:** unified-cache-manager.js (עם prefix)

**בעיה:** פורמטים שונים מקשים על ניהול מטמון

## סיכום

**מספר שכבות מטמון:** 4 (memory, localStorage, IndexedDB, backend)
**מספר נקודות כניסה:** 4 (UnifiedCacheManager, PreferencesCore, PreferencesData, CacheSyncManager)
**מספר invalidation patterns:** 3
**מספר race conditions מזוהות:** 3
**מספר פורמטי cache keys:** 4

**המלצות:**

1. איחוד פורמט cache keys - `preference_{type}_{identifier}_{userId}_{profileId}`
2. הוספת deduplication בכל נקודות הכניסה
3. הסרת טעינה מחדש מ-`refreshUserPreferences()`
4. הוספת locking mechanism למניעת race conditions
5. איחוד invalidation patterns - דרך אחת בלבד

