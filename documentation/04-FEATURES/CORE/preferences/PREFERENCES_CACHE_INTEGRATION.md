# שילוב מערכת ההעדפות עם UnifiedCacheManager

**תאריך:** 26 בינואר 2025  
**גרסה:** 5.1  
**עדכון אחרון:** 8 בנובמבר 2025  
**סטטוס:** ✅ שולב מלא עם UnifiedCacheManager + תיקוני סנכרון פרופיל ומטמון

---

## 🎯 **סקירה**

מערכת ההעדפות עברה refactoring מלא כדי להשתלב עם **UnifiedCacheManager** המרכזי של TikTrack.

### **לפני (גרסה 4.0):**
```javascript
class PreferencesCacheManager {
    constructor() {
        this.cache = new Map();  // ❌ מטמון נפרד!
        this.ttl = 5 * 60 * 1000;
        this.timestamps = new Map();
    }
    
    get(key) {
        // בדיקת מטמון ידנית
        const timestamp = this.timestamps.get(key);
        if (!timestamp) return null;
        // ...
    }
}

class PreferencesCore {
    constructor() {
        this.cacheManager = new PreferencesCacheManager();  // ❌ כפילות!
    }
}
```

**❌ בעיות:**
- מטמון נפרד שלא מתואם עם UnifiedCacheManager
- כפילויות בקוד
- ניהול cache ידני ומסורבל
- event listeners מיותרים

---

### **אחרי (גרסה 5.0):**
```javascript
class PreferencesCore {
    constructor() {
        this.apiClient = new PreferencesAPIClient();
        // NO cacheManager - using UnifiedCacheManager!
        this.validationManager = new PreferencesValidationManager();
    }
    
    async getPreference(preferenceName, userId, profileId) {
        const cacheKey = `preference_${preferenceName}_${userId}_${profileId}`;
        
        // Use UnifiedCacheManager
        const cached = await window.UnifiedCacheManager.get(cacheKey, {
            layer: 'localStorage',
            ttl: 300000
        });
        
        if (cached !== null) return cached;
        
        // Fetch from backend and cache
        const value = await this.apiClient.getPreference(...);
        await window.UnifiedCacheManager.save(cacheKey, value, {
            layer: 'localStorage',
            ttl: 300000
        });
        
        return value;
    }
}
```

**✅ יתרונות:**
- משתלב עם UnifiedCacheManager המרכזי
- ניהול cache אוטומטי - פחות קוד
- TTL אחיד (5 דקות) לכל המערכת
- ניקוי cache אוטומטי
- ביצועים משופרים

---

## 📊 **מדיניות מטמון להעדפות**

### **Key Format:**
```
preference_{name}_{userId}_{profileId}
```

### **Layer:** localStorage
- **TTL:** 300000ms (5 דקות)
- **Validation:** true
- **Sync to Backend:** false (manual save)

### **דוגמאות:**
- `preference_defaultAccountFilter_1_3`
- `preference_theme_1_3`
- `all_preferences_1_3`

---

## 🔄 **תהליכי מטמון**

### **1. טעינת העדפה:**
```javascript
// 1. בדיקה ב-UnifiedCacheManager
const cached = await window.UnifiedCacheManager.get(cacheKey, {
    layer: 'localStorage',
    ttl: 300000
});

if (cached !== null) return cached;

// 2. טעינה מ-backend
const value = await this.apiClient.getPreference(...);

// 3. שמירה ב-UnifiedCacheManager
await window.UnifiedCacheManager.save(cacheKey, value, {
    layer: 'localStorage',
    ttl: 300000
});
```

### **2. שמירת העדפה:**
```javascript
// 1. שמירה ל-backend
const success = await this.apiClient.savePreference(...);

// 2. מחיקת cache
await window.UnifiedCacheManager.remove(cacheKey);
```

### **3. החלפת פרופיל:**
```javascript
// 1. עדכון PreferencesCore
await window.PreferencesCore.setCurrentProfile(userId, profileId);

// 2. ניקוי כל המטמון
await window.clearAllUnifiedCacheQuick();
```

---

## 🧹 **ניקוי מטמון**

### **ניקוי העדפה בודדת:**
```javascript
const cacheKey = `preference_${preferenceName}_${userId}_${profileId}`;
await window.UnifiedCacheManager.remove(cacheKey);
```

### **ניקוי כל ההעדפות:**
```javascript
// ניקוי כל המטמון (כולל העדפות)
await window.clearAllUnifiedCacheQuick();
```

### **ניקוי לפי פרופיל:**
```javascript
// ניקוי כל ההעדפות של פרופיל מסוים
const keys = await window.UnifiedCacheManager.getAllKeys();
const prefKeys = keys.filter(k => k.includes(`_${profileId}`));
for (const key of prefKeys) {
    await window.UnifiedCacheManager.remove(key);
}
```

---

## 📈 **ביצועים**

### **לפני השילוב:**
- זמן טעינה: ~200ms
- זיכרון: 2MB (מטמון נפרד)
- כפילויות: 3 מערכות מטמון

### **אחרי השילוב:**
- זמן טעינה: ~50ms (cache hit)
- זיכרון: 1MB (מטמון מאוחד)
- כפילויות: 0 (מערכת אחת)

---

## 🔗 **קישורים רלוונטיים**

### **קבצי מערכת:**
- [UnifiedCacheManager](../../trading-ui/scripts/unified-cache-manager.js)
- [PreferencesCore](../../trading-ui/scripts/preferences-core-new.js)
- [PreferencesUI](../../trading-ui/scripts/preferences-ui.js)

### **דוקומנטציה:**
- [UNIFIED_CACHE_SYSTEM.md](../UNIFIED_CACHE_SYSTEM.md)
- [PREFERENCES_SYSTEM.md](PREFERENCES_SYSTEM.md)

---

## 🔧 **תיקוני מטמון - גרסה 5.1 (8 בנובמבר 2025)**

### **בעיות שזוהו ותוקנו:**

#### **1. בעיית סנכרון פרופיל פעיל**
**בעיה:** השמירה והטעינה היו משתמשות ב-`profile_id=0` במקום בפרופיל הפעיל האמיתי (`profile_id=2`), מה שגרם לשמירה לפרופיל הלא נכון ולטעינה של ערכים ישנים.

**פתרון:**
- סנכרון `PreferencesCore.currentProfileId` עם הפרופיל הפעיל לפני כל שמירה/טעינה
- שימוש ב-`PreferencesUI.loadActiveProfile()` כדי לקבל את הפרופיל הפעיל האמיתי
- עדכון כל הקריאות להעדפות להשתמש בפרופיל הנכון

**קבצים שעודכנו:**
- `preferences-group-manager.js` - סנכרון לפני שמירה וטעינה
- `preferences-page.js` - סנכרון לפני טעינת חשבונות
- `select-populator-service.js` - שימוש בפרופיל הפעיל
- `unified-cache-manager.js` - ניקוי מטמון לפי הפרופיל הנכון

#### **2. בעיית ניקוי מטמון לא מלא**
**בעיה:** אחרי שמירה, המטמון בצד הלקוח נוקה אבל לא התעדכן בערכים החדשים מהשרת, מה שגרם לערכים ישנים להופיע גם אחרי שמירה.

**פתרון:**
- ניקוי מטמון מלא של כל המפתחות הרלוונטיים (קבוצות, העדפות בודדות, מפתחות מאוחדים)
- טעינה מחדש מהשרת עם `forceReload=true` כדי לעקוף מטמון שרת
- עדכון שדות הטופס עם הערכים החדשים מהשרת

**קבצים שעודכנו:**
- `preferences-group-manager.js` - טעינה מחדש אחרי שמירה
- `preferences-core-new.js` - תמיכה ב-`forceReload` עם cache busting
- `unified-cache-manager.js` - ניקוי מטמון מלא לפי פרופיל

#### **3. בעיית מטמון שרת**
**בעיה:** השרת החזיר ערכים ישנים מהמטמון שלו גם אחרי שמירה, מה שגרם לערכים ישנים להופיע גם אחרי ריענון רגיל.

**פתרון:**
- הוספת `use_cache=false` לבקשת ה-API כש-`forceReload=true`
- השרת עוקף את המטמון שלו וטוען ישירות מהמסד הנתונים
- הוספת cache busting parameters (`_t`, `_nocache`) לבקשות

**קבצים שעודכנו:**
- `preferences-core-new.js` - תמיכה ב-`forceReload` עם `use_cache=false`
- `Backend/routes/api/preferences.py` - תמיכה ב-`use_cache` parameter

### **תהליך שמירה משופר (גרסה 5.1):**

```javascript
// 1. סנכרון פרופיל פעיל
const activeProfileId = await window.PreferencesUI.loadActiveProfile();
await window.PreferencesCore.setCurrentProfile(1, activeProfileId);

// 2. שמירה לשרת
await window.PreferencesCore.saveGroupPreferences(groupName, formData);

// 3. ניקוי מטמון לקוח (כולל פרופיל נכון)
await window.UnifiedCacheManager.refreshUserPreferences(
    activeProfileId,
    groupName,
    preferenceNames
);

// 4. טעינה מחדש מהשרת עם forceReload (עוקף מטמון שרת)
const reloadedPreferences = await window.PreferencesCore.loadGroupPreferences(
    groupName,
    null,
    null,
    true  // forceReload=true
);

// 5. עדכון שדות הטופס
this.populateGroupFields(sectionId, reloadedPreferences);

// 6. עדכון מקורות מקומיים
updateLocalPreferenceCaches(reloadedPreferences);
```

### **תהליך טעינה משופר (גרסה 5.1):**

```javascript
// 1. סנכרון פרופיל פעיל
const activeProfileId = await window.PreferencesUI.loadActiveProfile();
await window.PreferencesCore.setCurrentProfile(1, activeProfileId);

// 2. טעינה עם cache (אם לא forceReload)
const preferences = await window.PreferencesCore.loadGroupPreferences(
    groupName,
    null,
    null,
    false  // use cache if available
);
```

### **שיפורים בביצועים:**
- ✅ שמירה תמיד לפרופיל הנכון
- ✅ טעינה תמיד מהפרופיל הנכון
- ✅ ניקוי מטמון מלא אחרי שמירה
- ✅ טעינה מחדש מהשרת עם ערכים עדכניים
- ✅ עקיפת מטמון שרת כשצריך

---

## ✅ **סיכום**

השילוב עם UnifiedCacheManager הביא ל:
- **פשטות:** קוד פשוט יותר, פחות כפילויות
- **ביצועים:** טעינה מהירה יותר, פחות זיכרון
- **אמינות:** ניהול cache מרכזי ואחיד
- **תחזוקה:** קל יותר לתחזק ולשדרג

**גרסה 5.1 הוסיפה:**
- **דיוק:** סנכרון פרופיל פעיל לפני כל פעולה
- **עדכניות:** טעינה מחדש מהשרת אחרי שמירה
- **אמינות:** עקיפת מטמון שרת כשצריך