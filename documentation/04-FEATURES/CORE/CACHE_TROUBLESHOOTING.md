# Cache Troubleshooting Guide - TikTrack
# מדריך פתרון בעיות מטמון

**תאריך עדכון:** 26 בינואר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ פעיל  
**מטרה:** מדריך מקיף לפתרון בעיות במערכת המטמון  

---

## 📋 סקירה כללית

מדריך זה מספק פתרונות לבעיות נפוצות במערכת המטמון, כלי דיבוג, ופקודות אימות.

---

## 🚨 Common Issues and Solutions

### 1. Cache Not Clearing

#### בעיה: מטמון לא מתנקה אחרי החלפת פרופיל
**תסמינים:**
- העדפות ישנות נשארות
- UI לא מתעדכן
- נתונים לא עקביים

**פתרון:**
```javascript
// בדיקת מטמון
const keys = await UnifiedCacheManager.getAllKeys();
console.log('Cache keys:', keys);

// ניקוי ממוקד
const prefKeys = keys.filter(k => k.includes('preference_'));
for (const key of prefKeys) {
    await UnifiedCacheManager.remove(key);
}

// ניקוי מלא
await UnifiedCacheManager.clearAllCache();
```

#### בעיה: localStorage לא מתנקה
**תסמינים:**
- נתונים ישנים ב-localStorage
- שגיאות JSON.parse
- נתונים לא עקביים

**פתרון:**
```javascript
// ניקוי localStorage ישיר
Object.keys(localStorage).forEach(key => {
    if (key.startsWith('tiktrack-')) {
        localStorage.removeItem(key);
    }
});

// ניקוי דרך UnifiedCacheManager
await UnifiedCacheManager.clear('localStorage');
```

### 2. Cache Sync Issues

#### בעיה: Frontend לא מסתנכרן עם Backend
**תסמינים:**
- נתונים לא נשמרים בשרת
- שגיאות 404 ב-API
- CacheSyncManager לא עובד

**פתרון:**
```javascript
// בדיקת חיבור לשרת
const isConnected = await CacheSyncManager.checkServerConnection();
console.log('Server connected:', isConnected);

// בדיקת סטטוס סינכרון
const syncStatus = CacheSyncManager.getSyncStatus();
console.log('Sync status:', syncStatus);

// ניקוי תור סינכרון
CacheSyncManager.clearQueue();
```

#### בעיה: שגיאות API
**תסמינים:**
- שגיאות 500 ב-API
- timeout errors
- JSON parsing errors

**פתרון:**
```javascript
// בדיקת API endpoints
try {
    const response = await fetch('/api/cache/status');
    const data = await response.json();
    console.log('API status:', data);
} catch (error) {
    console.error('API error:', error);
}

// בדיקת Backend Cache Service
const backendStats = await fetch('/api/cache/status');
console.log('Backend cache stats:', await backendStats.json());
```

### 3. Performance Issues

#### בעיה: מטמון איטי
**תסמינים:**
- טעינת עמודים איטית
- UI לא מגיב
- שגיאות timeout

**פתרון:**
```javascript
// בדיקת ביצועים
const stats = await UnifiedCacheManager.getStats();
console.log('Performance stats:', stats.performance);

// ניקוי מטמון ישן
const keys = await UnifiedCacheManager.getAllKeys();
const oldKeys = keys.filter(key => {
    // בדיקת גיל מפתח
    return key.includes('old-') || key.includes('temp-');
});

for (const key of oldKeys) {
    await UnifiedCacheManager.remove(key);
}
```

#### בעיה: זיכרון מלא
**תסמינים:**
- שגיאות "QuotaExceededError"
- דפדפן איטי
- קריסות

**פתרון:**
```javascript
// בדיקת גודל מטמון
const stats = await UnifiedCacheManager.getStats();
console.log('Cache size:', stats.layers);

// ניקוי מטמון גדול
const largeKeys = await UnifiedCacheManager.getLargeKeys();
for (const key of largeKeys) {
    await UnifiedCacheManager.remove(key);
}

// ניקוי מטמון לפי TTL
await UnifiedCacheManager.cleanupExpired();
```

---

## 🔍 Debugging Tools

### 1. Console Commands

#### בדיקת מטמון כללי
```javascript
// בדיקת סטטוס מערכת
window.debugCacheSystem();

// בדיקת מפתחות
const keys = await window.UnifiedCacheManager.getAllKeys();
console.log('All cache keys:', keys);

// בדיקת סטטיסטיקות
const stats = await window.UnifiedCacheManager.getStats();
console.log('Cache stats:', stats);
```

#### בדיקת העדפות
```javascript
// בדיקת העדפות ספציפיות
window.debugPreferencesCache();

// בדיקת החלפת פרופיל
window.debugProfileSwitch();

// בדיקת מפתח העדפה
window.debugPreferenceCache('primaryColor');
```

#### בדיקת סינכרון
```javascript
// בדיקת סטטוס סינכרון
const syncStatus = window.CacheSyncManager.getSyncStatus();
console.log('Sync status:', syncStatus);

// בדיקת תור סינכרון
const queueStatus = window.CacheSyncManager.getQueueStatus();
console.log('Queue status:', queueStatus);
```

### 2. Browser DevTools

#### Application Tab
1. **Local Storage:**
   - בדיקת מפתחות `tiktrack-*`
   - בדיקת גודל וזמן
   - מחיקת מפתחות ישנים

2. **IndexedDB:**
   - בדיקת databases
   - בדיקת object stores
   - ניקוי נתונים ישנים

3. **Cache Storage:**
   - בדיקת service worker cache
   - ניקוי cache ישן
   - בדיקת TTL

#### Network Tab
1. **API Calls:**
   - בדיקת `/api/cache/*` calls
   - בדיקת response codes
   - בדיקת response times

2. **Cache Headers:**
   - בדיקת cache-control headers
   - בדיקת etag headers
   - בדיקת last-modified

### 3. Performance Monitoring

#### Memory Usage
```javascript
// בדיקת שימוש בזיכרון
const memoryUsage = performance.memory;
console.log('Memory usage:', {
    used: memoryUsage.usedJSHeapSize,
    total: memoryUsage.totalJSHeapSize,
    limit: memoryUsage.jsHeapSizeLimit
});
```

#### Cache Performance
```javascript
// בדיקת ביצועי מטמון
const startTime = performance.now();
await UnifiedCacheManager.get('test-key');
const endTime = performance.now();
console.log('Cache response time:', endTime - startTime, 'ms');
```

---

## 🛠️ Verification Steps

### 1. System Health Check

#### שלב 1: בדיקת מערכות בסיסיות
```javascript
// בדיקת UnifiedCacheManager
const isUnifiedCacheAvailable = typeof window.UnifiedCacheManager === 'object';
console.log('UnifiedCacheManager available:', isUnifiedCacheAvailable);

// בדיקת CacheSyncManager
const isCacheSyncAvailable = typeof window.CacheSyncManager === 'object';
console.log('CacheSyncManager available:', isCacheSyncAvailable);

// בדיקת PreferencesCore
const isPreferencesCoreAvailable = typeof window.PreferencesCore === 'object';
console.log('PreferencesCore available:', isPreferencesCoreAvailable);
```

#### שלב 2: בדיקת אתחול
```javascript
// בדיקת אתחול UnifiedCacheManager
const isUnifiedCacheInitialized = window.UnifiedCacheManager?.initialized;
console.log('UnifiedCacheManager initialized:', isUnifiedCacheInitialized);

// בדיקת אתחול CacheSyncManager
const isCacheSyncInitialized = window.CacheSyncManager?.initialized;
console.log('CacheSyncManager initialized:', isCacheSyncInitialized);
```

#### שלב 3: בדיקת חיבור לשרת
```javascript
// בדיקת חיבור API
try {
    const response = await fetch('/api/cache/status');
    const data = await response.json();
    console.log('API connection:', data.success);
} catch (error) {
    console.error('API connection failed:', error);
}
```

### 2. Cache Functionality Test

#### שלב 1: בדיקת שמירה וטעינה
```javascript
// שמירת נתון
const testKey = 'test-cache-key';
const testData = { test: 'data', timestamp: Date.now() };

await UnifiedCacheManager.save(testKey, testData, {
    layer: 'localStorage',
    ttl: 60000 // 1 דקה
});

// טעינת נתון
const loadedData = await UnifiedCacheManager.get(testKey);
console.log('Cache test:', loadedData);

// ניקוי נתון בדיקה
await UnifiedCacheManager.remove(testKey);
```

#### שלב 2: בדיקת ניקוי מטמון
```javascript
// בדיקת ניקוי ממוקד
await UnifiedCacheManager.remove('test-key');
console.log('Targeted clear: OK');

// בדיקת ניקוי לפי דפוס
await UnifiedCacheManager.removePattern('test-*');
console.log('Pattern clear: OK');

// בדיקת ניקוי מלא
await UnifiedCacheManager.clearAllCache();
console.log('Full clear: OK');
```

### 3. Integration Test

#### שלב 1: בדיקת העדפות
```javascript
// בדיקת שמירת העדפה
const success = await PreferencesCore.savePreference('testPref', 'testValue', 1, 1);
console.log('Preference save:', success);

// בדיקת טעינת העדפה
const value = await PreferencesCore.getPreference('testPref', 1, 1);
console.log('Preference load:', value);
```

#### שלב 2: בדיקת החלפת פרופיל
```javascript
// החלפת פרופיל
await PreferencesCore.setCurrentProfile(1, 2);
console.log('Profile switch: OK');

// בדיקת ניקוי מטמון
const keys = await UnifiedCacheManager.getAllKeys();
const prefKeys = keys.filter(k => k.includes('preference_'));
console.log('Preference keys after switch:', prefKeys.length);
```

---

## 📊 Performance Benchmarks

### 1. Response Times
- **Memory Layer:** < 1ms
- **localStorage:** < 5ms
- **IndexedDB:** < 50ms
- **Backend Cache:** < 200ms

### 2. Cache Sizes
- **Memory:** < 100KB
- **localStorage:** < 1MB
- **IndexedDB:** < 10MB
- **Backend Cache:** < 100MB

### 3. Hit Rates
- **Target Hit Rate:** > 80%
- **Acceptable Hit Rate:** > 60%
- **Critical Hit Rate:** < 40%

---

## 🚑 Emergency Procedures

### 1. Complete Cache Reset
```javascript
// ניקוי מלא של כל המטמון
await UnifiedCacheManager.clearAllCache();

// ניקוי localStorage ישיר
Object.keys(localStorage).forEach(key => {
    if (key.startsWith('tiktrack-')) {
        localStorage.removeItem(key);
    }
});

// ניקוי IndexedDB
if (window.indexedDB) {
    const deleteRequest = indexedDB.deleteDatabase('tiktrack-cache');
    deleteRequest.onsuccess = () => console.log('IndexedDB cleared');
}
```

### 2. Server Cache Reset
```javascript
// ניקוי מטמון שרת
try {
    const response = await fetch('/api/cache/invalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dependencies: ['all'] })
    });
    console.log('Server cache cleared:', response.ok);
} catch (error) {
    console.error('Server cache clear failed:', error);
}
```

### 3. System Restart
```javascript
// רענון דף מלא
window.location.reload(true);

// או רענון עם ניקוי מטמון
localStorage.clear();
sessionStorage.clear();
window.location.reload(true);
```

---

## 📝 Logging and Monitoring

### 1. Console Logging
```javascript
// הפעלת לוגים מפורטים
window.UnifiedCacheManager.debugMode = true;
window.CacheSyncManager.debugMode = true;

// בדיקת לוגים
console.log('Cache debug mode enabled');
```

### 2. Performance Monitoring
```javascript
// ניטור ביצועים
setInterval(async () => {
    const stats = await UnifiedCacheManager.getStats();
    console.log('Cache performance:', stats.performance);
}, 30000); // כל 30 שניות
```

### 3. Error Tracking
```javascript
// מעקב שגיאות
window.addEventListener('error', (event) => {
    if (event.message.includes('cache') || event.message.includes('Cache')) {
        console.error('Cache error detected:', event);
    }
});
```

---

## 🎯 Summary

מדריך זה מספק:
- **פתרונות לבעיות נפוצות** במערכת המטמון
- **כלי דיבוג מתקדמים** לזיהוי בעיות
- **פקודות אימות** לבדיקת תקינות
- **נהלי חירום** לפתרון בעיות קריטיות

**זכור:** תמיד בדוק את הלוגים לפני ביצוע פעולות חירום!
