# ניתוח תהליך שמירת העדפות - שלב 1.2

## מטרת המסמך

תיעוד מלא של כל השלבים אחרי שמירת העדפות, זיהוי כל הקריאות ל-refresh/reload, מיפוי זרימת המטמון, וזיהוי טעינות מיותרות.

## נתיבי שמירה קיימים

### 1. דרך PreferencesGroupManager.saveGroup()

**קובץ:** `trading-ui/scripts/preferences-group-manager.js`

**מיקום:** שורות 512-617

**תהליך:**

```javascript
async saveGroup(groupName) {
  // 1. Collect form data
  const formData = this.collectGroupData(section);

  // 2. Save via PreferencesCore
  const results = await window.PreferencesCore.saveGroupPreferences(groupName, formData);

  // 3. Clear cache
  if (window.UnifiedCacheManager && window.UnifiedCacheManager.refreshUserPreferences) {
    await window.UnifiedCacheManager.refreshUserPreferences(profileId, groupName, {
      userId,
      preferenceNames: savedKeys,
    });
  }

  // 4. Refresh group state
  await this.refreshGroupState(groupName, savedKeys);

  // 5. Dispatch event
  window.dispatchEvent(new CustomEvent('preferences:types-refresh', {
    detail: { source: 'preferences-group-manager', groupName, savedKeys },
  }));
}
```

**שלבים אחרי שמירה:**

1. `refreshUserPreferences()` - ניקוי מטמון
2. `refreshGroupState()` - טעינה מחדש מהשרת
3. `populateGroupFields()` - מילוי שדות מחדש
4. Event dispatch - `preferences:types-refresh`

### 2. דרך PreferencesData.savePreferences()

**קובץ:** `trading-ui/scripts/services/preferences-data.js`

**מיקום:** שורות 991-1093

**תהליך:**

```javascript
async function savePreferences({ preferences = {}, userId = 1, profileId = null }) {
  // 1. Save to backend
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ preferences, user_id: userId, profile_id: profileId }),
  });

  // 2. Handle response via CRUDResponseHandler
  const crudResult = await window.CRUDResponseHandler.handleSaveResponse(response, {...});

  // 3. Cache invalidation via CacheSyncManager
  if (window.CacheSyncManager?.invalidateByAction) {
    await window.CacheSyncManager.invalidateByAction('preference-updated');
  } else {
    // Fallback: direct cache clearing
    await clearCachePattern(KEY_PREFIXES.single);
    await clearCachePattern(KEY_PREFIXES.all);
  }

  // 4. Unified cache refresh
  if (window.UnifiedCacheManager?.refreshUserPreferences) {
    await window.UnifiedCacheManager.refreshUserPreferences(
      profileId ?? 'active',
      null,
      { userId, preferenceNames: Object.keys(preferences) },
    );
  }
}
```

**שלבים אחרי שמירה:**

1. `CacheSyncManager.invalidateByAction()` - ניקוי מטמון
2. `clearCachePattern()` - ניקוי מטמון ישיר (fallback)
3. `refreshUserPreferences()` - רענון מטמון

### 3. דרך PreferencesCore.saveGroupPreferences()

**קובץ:** `trading-ui/scripts/preferences-core-new.js`

**מיקום:** שורות 1005-1080

**תהליך:**

```javascript
async saveGroupPreferences(groupName, preferences, userId = null, profileId = null) {
  // 1. Save via API client
  const result = await this.apiClient.saveGroupPreferences(groupName, preferences, userId, profileId);

  // 2. Invalidate cache
  if (window.UnifiedCacheManager) {
    await window.UnifiedCacheManager.remove(`all_preferences_${userId}_${profileId}`);
  }

  // 3. Update local state
  if (window.currentPreferences) {
    Object.assign(window.currentPreferences, preferences);
  }
}
```

**שלבים אחרי שמירה:**

1. `UnifiedCacheManager.remove()` - ניקוי מטמון
2. `Object.assign()` - עדכון state מקומי

## זרימת המטמון אחרי שמירה

### תסריט 1: שמירה דרך PreferencesGroupManager

```
saveGroup()
  ↓
PreferencesCore.saveGroupPreferences()
  ↓
PreferencesData.savePreferences()
  ↓
CacheSyncManager.invalidateByAction('preference-updated')
  ↓
UnifiedCacheManager.refreshUserPreferences()
  ↓
UnifiedCacheManager.remove() - ניקוי מטמון
  ↓
PreferencesGroupManager.refreshGroupState()
  ↓
PreferencesCore.loadGroupPreferences(forceRefresh=true)
  ↓
PreferencesData.loadAllPreferencesRaw() - טעינה מחדש מהשרת! ⚠️
  ↓
PreferencesGroupManager.populateGroupFields() - מילוי שדות מחדש
```

### תסריט 2: שמירה ישירה דרך PreferencesData

```
savePreferences()
  ↓
CacheSyncManager.invalidateByAction('preference-updated')
  ↓
UnifiedCacheManager.refreshUserPreferences()
  ↓
UnifiedCacheManager.remove() - ניקוי מטמון
  ↓
PreferencesGroupManager.loadGroupData() - טעינה מחדש! ⚠️
  ↓
PreferencesGroupManager.populateGroupFields() - מילוי שדות מחדש
```

## טעינות מיותרות מזוהות

### טעינה מיותרת 1: refreshGroupState() אחרי שמירה

**מיקום:** `preferences-group-manager.js:578`

**בעיה:** אחרי שמירה מוצלחת, הערכים כבר נשמרו. אין צורך לטעון מחדש מהשרת - אפשר להשתמש בערכים שכבר נשמרו.

**פתרון מוצע:** עדכון אופטימי של UI עם הערכים שנשמרו, ללא טעינה מחדש.

### טעינה מיותרת 2: loadGroupData() ב-refreshUserPreferences()

**מיקום:** `unified-cache-manager.js:3280-3302`

**בעיה:** `refreshUserPreferences()` קורא ל-`loadGroupData()` שטוען מחדש מהשרת, גם אחרי שמירה מוצלחת.

**פתרון מוצע:** `refreshUserPreferences()` צריך רק לנקות מטמון, לא לטעון מחדש.

### טעינה מיותרת 3: populateGroupFields() פעמיים

**מיקום:**

- `preferences-group-manager.js:713` - ב-refreshGroupState()
- Event listener `preferences:updated` - ב-preferences-ui-v4.js:254

**בעיה:** `populateGroupFields()` נקרא פעמיים: פעם אחת ב-refreshGroupState() ופעם נוספת ב-event listener.

**פתרון מוצע:** הסרת אחד מהקריאות, או בדיקה אם כבר בוצע population.

### טעינה מיותרת 4: loadGroupPreferences(forceRefresh=true)

**מיקום:** `preferences-group-manager.js:312`

**בעיה:** אחרי שמירה, `loadGroupData()` קורא ל-`loadGroupPreferences(forceRefresh=true)` שטוען מחדש מהשרת, גם כשהערכים כבר נשמרו.

**פתרון מוצע:** שימוש בערכים שכבר נשמרו, ללא forceRefresh.

## קריאות ל-refresh/reload מזוהות

### 1. refreshUserPreferences()

**מיקומים:**

- `preferences-group-manager.js:571` - אחרי saveGroup()
- `preferences-data.js:1037` - אחרי savePreferences()
- `unified-cache-manager.js:3270` - ניקוי מטמון

**תפקיד:** ניקוי מטמון + טעינה מחדש (מיותר!)

### 2. refreshGroupState()

**מיקום:** `preferences-group-manager.js:578`

**תפקיד:** טעינה מחדש מהשרת + מילוי שדות (מיותר אחרי שמירה!)

### 3. loadGroupData()

**מיקומים:**

- `preferences-group-manager.js:265` - כשפותחים section
- `unified-cache-manager.js:3287` - ב-refreshUserPreferences()

**תפקיד:** טעינה מהשרת + מילוי שדות

### 4. populateGroupFields()

**מיקומים:**

- `preferences-group-manager.js:313` - ב-loadGroupData()
- `preferences-group-manager.js:713` - ב-refreshGroupState()
- `preferences-ui-v4.js:234` - ב-initialize()
- `preferences-ui-v4.js:254` - ב-event listener

**תפקיד:** מילוי שדות UI

## סיכום

**מספר נתיבי שמירה:** 3
**מספר טעינות מיותרות מזוהות:** 4
**מספר קריאות ל-refresh/reload:** 4

**המלצות:**

1. הסרת `refreshGroupState()` אחרי שמירה מוצלחת
2. הסרת `loadGroupData()` מ-`refreshUserPreferences()`
3. עדכון אופטימי של UI עם הערכים שנשמרו
4. איחוד `populateGroupFields()` - רק נקודת כניסה אחת

