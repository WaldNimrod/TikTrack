# דיאגרמות זרימה - מערכת העדפות

## דיאגרמת זרימה 1: תהליך טעינת עמוד

```
┌─────────────────────────────────────────────────────────────┐
│                    טעינת עמוד העדפות                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  page-initialization-configs.js   │
        │  customInitializers[preferences]  │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │   PreferencesUIV4.initialize()    │
        └───────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                         │
        ▼                                         ▼
┌──────────────────────┐            ┌──────────────────────┐
│ PreferencesCore.     │            │ PreferencesV4.       │
│ initializeWithLazy   │            │ bootstrap()          │
│ Loading()            │            └──────────────────────┘
└──────────────────────┘                      │
        │                                      ▼
        ▼                            ┌──────────────────────┐
┌──────────────────────┐             │  Load required       │
│ LazyLoader.          │             │  groups              │
│ initialize()          │             └──────────────────────┘
└──────────────────────┘                      │
        │                                      ▼
        ▼                            ┌──────────────────────┐
┌──────────────────────┐             │ PreferencesCore.     │
│ loadCritical         │             │ getAllPreferences()  │
│ Preferences()        │             └──────────────────────┘
└──────────────────────┘                      │
        │                                      ▼
        ▼                            ┌──────────────────────┐
┌──────────────────────┐             │ _populateAllForm      │
│ startBackground      │             │ Fields()              │
│ Loading()            │             └──────────────────────┘
└──────────────────────┘                      │
        │                                      ▼
        ▼                            ┌──────────────────────┐
┌──────────────────────┐             │ PreferencesGroup     │
│ Event: preferences:  │             │ Manager.populate     │
│ critical-loaded      │             │ GroupFields()        │
└──────────────────────┘             └──────────────────────┘
        │                                      │
        └──────────────────┬───────────────────┘
                           ▼
                ┌──────────────────────┐
                │  updatePreferences   │
                │  Summary()            │
                └──────────────────────┘
```

## דיאגרמת זרימה 2: תהליך שמירה

```
┌─────────────────────────────────────────────────────────────┐
│                    שמירת העדפות                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  PreferencesGroupManager.        │
        │  saveGroup(groupName)            │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  collectGroupData(section)        │
        │  - איסוף נתונים מהטופס            │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  PreferencesCore.                 │
        │  saveGroupPreferences()           │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  PreferencesData.                 │
        │  savePreferences()                │
        │  - שמירה לשרת                     │
        └───────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                         │
        ▼                                         ▼
┌──────────────────────┐            ┌──────────────────────┐
│ CacheSyncManager.   │            │ UnifiedCacheManager. │
│ invalidateByAction  │            │ refreshUser          │
│ ('preference-       │            │ Preferences()        │
│  updated')          │            └──────────────────────┘
└──────────────────────┘                      │
        │                                      ▼
        ▼                            ┌──────────────────────┐
┌──────────────────────┐             │ remove() - ניקוי     │
│ clearCachePattern()  │             │ מטמון מכל השכבות     │
│ - ניקוי מטמון        │             └──────────────────────┘
└──────────────────────┘                      │
        │                                      ▼
        └──────────────────┬───────────────────┘
                           │
                           ▼
        ┌───────────────────────────────────┐
        │  PreferencesGroupManager.         │
        │  refreshGroupState()              │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  PreferencesCore.                 │
        │  loadGroupPreferences(            │
        │    forceRefresh=true)             │
        │  - טעינה מחדש מהשרת! ⚠️          │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  PreferencesGroupManager.         │
        │  populateGroupFields()            │
        │  - מילוי שדות מחדש                │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  Event: preferences:group-updated │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  Event: preferences:updated        │
        │  (אם יש listener)                  │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  PreferencesUIV4.                 │
        │  _populateAllFormFields()         │
        │  - מילוי שוב! ⚠️                  │
        └───────────────────────────────────┘
```

## דיאגרמת זרימה 3: ניהול מטמון

```
┌─────────────────────────────────────────────────────────────┐
│                    קריאת העדפות                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  PreferencesCore.                 │
        │  loadGroupPreferences()           │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  UnifiedCacheManager.get()        │
        └───────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                         │
        ▼                                         ▼
┌──────────────────────┐            ┌──────────────────────┐
│ Layer 1: Memory      │            │ Layer 2: localStorage│
│ this.layers.memory   │            │ localStorage.getItem()│
│ .get(key)            │            └──────────────────────┘
└──────────────────────┘                      │
        │                                      ▼
        │                            ┌──────────────────────┐
        │                            │ Layer 3: IndexedDB   │
        │                            │ this.layers.indexedDB│
        │                            │ .get(key)             │
        │                            └──────────────────────┘
        │                                      │
        │                                      ▼
        │                            ┌──────────────────────┐
        │                            │ Layer 4: Backend API │
        │                            │ fetch('/api/...')    │
        │                            └──────────────────────┘
        │                                      │
        └──────────────────┬───────────────────┘
                           │
                           ▼
        ┌───────────────────────────────────┐
        │  UnifiedCacheManager.set()        │
        │  - שמירה בכל השכבות               │
        └───────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                         │
        ▼                                         ▼
┌──────────────────────┐            ┌──────────────────────┐
│ memory.set(key, val) │            │ localStorage.setItem()│
└──────────────────────┘            └──────────────────────┘
        │                                      │
        └──────────────────┬───────────────────┘
                           │
                           ▼
        ┌───────────────────────────────────┐
        │  IndexedDB.put(key, val)          │
        └───────────────────────────────────┘
```

## דיאגרמת זרימה 4: Invalidation Patterns

```
┌─────────────────────────────────────────────────────────────┐
│                    Invalidation Patterns                     │
└─────────────────────────────────────────────────────────────┘

Pattern 1: refreshUserPreferences()
────────────────────────────────────
saveGroup()
  ↓
refreshUserPreferences()
  ↓
remove() - מכל השכבות
  ↓
loadGroupData() - טעינה מחדש! ⚠️

Pattern 2: clearGroupCache()
─────────────────────────────
saveGroupPreferences()
  ↓
clearGroupCache()
  ↓
UnifiedCacheManager.remove(cacheKey)
  ↓
(אין טעינה מחדש - טוב!)

Pattern 3: CacheSyncManager
────────────────────────────
savePreferences()
  ↓
CacheSyncManager.invalidateByAction('preference-updated')
  ↓
clearCachePattern()
  ↓
refreshUserPreferences()
  ↓
loadGroupData() - טעינה מחדש! ⚠️
```

## רשימת בעיות מזוהות

### בעיה 1: טעינה מחדש מיותרת אחרי שמירה

**מיקום:** `refreshGroupState()` → `loadGroupPreferences(forceRefresh=true)`
**השפעה:** קריאת API מיותרת, איטיות
**פתרון מוצע:** עדכון אופטימי של UI עם הערכים שנשמרו

### בעיה 2: populateGroupFields() פעמיים

**מיקום:**

- `refreshGroupState()` → `populateGroupFields()`
- Event `preferences:updated` → `_populateAllFormFields()` → `populateGroupFields()`
**השפעה:** עדכון כפול של שדות
**פתרון מוצע:** הסרת אחד מהקריאות

### בעיה 3: refreshUserPreferences() טוען מחדש

**מיקום:** `unified-cache-manager.js:3280-3302`
**השפעה:** טעינה מחדש מהשרת אחרי ניקוי מטמון
**פתרון מוצע:** הסרת הטעינה מחדש, רק ניקוי מטמון

### בעיה 4: מספר נקודות כניסה למטמון

**מיקום:** UnifiedCacheManager, PreferencesCore, PreferencesData, CacheSyncManager
**השפעה:** קשה לעקוב אחרי ניהול מטמון
**פתרון מוצע:** נקודת כניסה אחת - PreferencesCache

### בעיה 5: פורמטי cache keys לא עקביים

**מיקום:**

- `preference_{name}_{userId}_{profileId}`
- `preference_group_{groupName}_{userId}_{profileId}`
- `preferences_all_u{userId}_p{profileId}`
- `tiktrack_preference_...`
**השפעה:** קשה לנהל מטמון
**פתרון מוצע:** פורמט אחיד `preference_{type}_{identifier}_{userId}_{profileId}`

### בעיה 6: Race Conditions

**מיקום:** Concurrent loads, Save + Load, Cache Invalidation + Read
**השפעה:** תוצאות לא עקביות
**פתרון מוצע:** Deduplication + Locking mechanism

### בעיה 7: מספר מערכות מקבילות

**מיקום:** PreferencesUI, PreferencesUIV4, PreferencesCore, PreferencesGroupManager
**השפעה:** סיבוכיות יתר
**פתרון מוצע:** איחוד ל-PreferencesManager מרכזי

## סיכום

**מספר בעיות מזוהות:** 7
**מספר טעינות מיותרות:** 3
**מספר כפילויות:** 3
**מספר race conditions:** 3

**עדיפויות:**

1. **גבוהה:** הסרת טעינות מיותרות אחרי שמירה
2. **גבוהה:** איחוד population - נקודת כניסה אחת
3. **בינונית:** איחוד ניהול מטמון
4. **בינונית:** פתרון race conditions
5. **נמוכה:** איחוד מערכות מקבילות (refactoring גדול)

