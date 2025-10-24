# Cache Standards - TikTrack
# סטנדרטי מטמון

**תאריך עדכון:** 26 בינואר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ פעיל  
**מטרה:** סטנדרטים אחידים לניהול מטמון במערכת  

---

## 📋 סקירה כללית

מסמך זה מגדיר סטנדרטים אחידים לניהול מטמון בכל המערכת, כולל פורמטים, מדיניות, ואסטרטגיות ניקוי.

---

## 🔑 Cache Key Standards

### פורמט מפתחות מטמון

#### 1. העדפות משתמש
```
preference_{name}_{userId}_{profileId}
```
**דוגמאות:**
- `preference_primaryColor_1_2`
- `preference_tablePageSize_1_3`
- `preference_enableNotifications_1_1`

#### 2. נתוני טבלאות
```
table-{tableId}-{filters}
```
**דוגמאות:**
- `table-trades-{"status":"active"}`
- `table-alerts-{"type":"price"}`

#### 3. נתוני מערכת
```
{system}-{dataType}-{identifier}
```
**דוגמאות:**
- `user-preferences`
- `profile-data`
- `accounts-data`
- `trades-data`

#### 4. מצב UI
```
{component}-{stateType}
```
**דוגמאות:**
- `table-trades-state`
- `filter-alerts-state`
- `ui-header-state`

---

## 🏗️ Cache Layer Assignment Rules

### 1. Frontend Memory Layer
**שימוש:**
- נתונים זמניים (<100KB)
- מצב UI זמני
- נתוני עמוד זמניים

**TTL:** עד רענון דף  
**דוגמאות:**
```javascript
// מצב UI זמני
await UnifiedCacheManager.save('ui-temp-state', data, {
    layer: 'memory',
    ttl: 300000 // 5 דקות
});
```

### 2. localStorage Layer
**שימוש:**
- נתונים פשוטים (<1MB)
- העדפות משתמש
- מצב מסננים
- הגדרות UI

**TTL:** 1 שעה (ברירת מחדל)  
**דוגמאות:**
```javascript
// העדפות משתמש
await UnifiedCacheManager.save('preference_primaryColor_1_2', '#26baac', {
    layer: 'localStorage',
    ttl: 300000 // 5 דקות
});
```

### 3. IndexedDB Layer
**שימוש:**
- נתונים מורכבים (>1MB)
- היסטוריית התראות
- ניתוחי קוד
- נתונים דחוסים

**TTL:** 24 שעות (ברירת מחדל)  
**דוגמאות:**
```javascript
// היסטוריית התראות
await UnifiedCacheManager.save('notifications-history', history, {
    layer: 'indexedDB',
    ttl: 86400000, // 24 שעות
    compress: true
});
```

### 4. Backend Cache Layer
**שימוש:**
- נתונים קריטיים עם TTL
- נתוני שוק
- נתוני טריידים
- נתונים שדורשים סינכרון

**TTL:** 30 שניות - 5 דקות  
**דוגמאות:**
```javascript
// נתוני שוק
await UnifiedCacheManager.save('market-data', data, {
    layer: 'backend',
    ttl: 30000, // 30 שניות
    syncToBackend: true
});
```

---

## ⏱️ TTL Guidelines

### TTL לפי סוג נתונים:

#### 1. נתונים קריטיים (30 שניות - 2 דקות)
- נתוני שוק
- מחירים עדכניים
- סטטוס עסקאות

#### 2. נתונים משתמש (5 דקות - 1 שעה)
- העדפות משתמש
- מצב UI
- מסננים

#### 3. נתונים היסטוריים (24 שעות - 7 ימים)
- היסטוריית התראות
- ניתוחי קוד
- לוגים

#### 4. נתונים קבועים (ללא TTL)
- הגדרות מערכת
- מבנה נתונים
- מטאדאטה

---

## 🧹 Clearing Strategies

### 1. ניקוי מלא (Full Clear)
**מתי:** רענון מערכת, החלפת פרופיל  
**מה:** כל שכבות המטמון  
**פונקציה:** `clearAllCache()`

### 2. ניקוי ממוקד (Targeted Clear)
**מתי:** עדכון העדפה, שינוי מסנן  
**מה:** מפתחות ספציפיים  
**פונקציה:** `remove(key)`

### 3. ניקוי לפי דפוס (Pattern Clear)
**מתי:** החלפת פרופיל, עדכון מערכת  
**מה:** מפתחות לפי דפוס  
**פונקציה:** `removePattern(pattern)`

### 4. ניקוי לפי תלות (Dependency Clear)
**מתי:** עדכון נתונים קשורים  
**מה:** מפתחות תלויים  
**פונקציה:** `invalidateByDependency(dep)`

---

## 📊 Best Practices

### 1. בחירת שכבה
```javascript
// ✅ נכון - בחירה לפי גודל וסוג
if (dataSize < 100000) {
    layer = 'localStorage';
} else if (dataSize < 1000000) {
    layer = 'indexedDB';
} else {
    layer = 'backend';
}

// ❌ לא נכון - בחירה שרירותית
layer = 'localStorage'; // תמיד
```

### 2. ניהול TTL
```javascript
// ✅ נכון - TTL לפי סוג נתונים
const ttl = dataType === 'market' ? 30000 : 300000;

// ❌ לא נכון - TTL קבוע
const ttl = 3600000; // תמיד שעה
```

### 3. ניקוי מטמון
```javascript
// ✅ נכון - ניקוי ממוקד
await UnifiedCacheManager.remove('preference_primaryColor_1_2');

// ❌ לא נכון - ניקוי מלא
await UnifiedCacheManager.clearAllCache();
```

### 4. טיפול בשגיאות
```javascript
// ✅ נכון - טיפול בשגיאות
try {
    await UnifiedCacheManager.save(key, data);
} catch (error) {
    console.warn('Cache save failed:', error);
    // fallback logic
}

// ❌ לא נכון - התעלמות משגיאות
await UnifiedCacheManager.save(key, data);
```

---

## 🔍 Debugging Tools

### 1. בדיקת מטמון
```javascript
// בדיקת מפתח ספציפי
const data = await UnifiedCacheManager.get('preference_primaryColor_1_2');
console.log('Cache data:', data);

// בדיקת כל המפתחות
const keys = await UnifiedCacheManager.getAllKeys();
console.log('All cache keys:', keys);
```

### 2. סטטיסטיקות מטמון
```javascript
// סטטיסטיקות כלליות
const stats = await UnifiedCacheManager.getStats();
console.log('Cache stats:', stats);

// סטטיסטיקות שכבה
const layerStats = await UnifiedCacheManager.getLayerStats('localStorage');
console.log('localStorage stats:', layerStats);
```

### 3. ניקוי מטמון
```javascript
// ניקוי מפתח ספציפי
await UnifiedCacheManager.remove('preference_primaryColor_1_2');

// ניקוי לפי דפוס
await UnifiedCacheManager.removePattern('preference_*');

// ניקוי מלא
await UnifiedCacheManager.clearAllCache();
```

---

## 📝 Examples

### 1. שמירת העדפה
```javascript
async function savePreference(name, value, userId, profileId) {
    const key = `preference_${name}_${userId}_${profileId}`;
    
    await UnifiedCacheManager.save(key, value, {
        layer: 'localStorage',
        ttl: 300000, // 5 דקות
        syncToBackend: true
    });
    
    // ניקוי מטמון קשור
    await UnifiedCacheManager.remove(`all_preferences_${userId}_${profileId}`);
}
```

### 2. טעינת נתוני טבלה
```javascript
async function loadTableData(tableId, filters) {
    const key = `table-${tableId}-${JSON.stringify(filters)}`;
    
    const data = await UnifiedCacheManager.get(key, {
        fallback: () => loadFromServer(tableId, filters),
        ttl: 300000 // 5 דקות
    });
    
    return data;
}
```

### 3. ניקוי מטמון החלפת פרופיל
```javascript
async function switchProfile(profileId) {
    // ניקוי מטמון העדפות
    const keys = await UnifiedCacheManager.getAllKeys();
    const prefKeys = keys.filter(k => 
        k.includes('preference_') || 
        k.includes('all_preferences_')
    );
    
    for (const key of prefKeys) {
        await UnifiedCacheManager.remove(key);
    }
    
    // עדכון פרופיל פעיל
    await UnifiedCacheManager.save('active-profile', profileId, {
        layer: 'localStorage',
        ttl: null // ללא TTL
    });
}
```

---

## 🎯 Summary

סטנדרטי המטמון מבטיחים:
- **עקביות** - פורמט אחיד לכל המפתחות
- **ביצועים** - בחירה נכונה של שכבות
- **אמינות** - טיפול נכון בשגיאות
- **תחזוקה** - קוד נקי ומובן

**זכור:** תמיד השתמש ב-UnifiedCacheManager ולא במערכות מטמון מקומיות!