# עיצוב פתרון אופטימלי - מערכת העדפות

## שלב 3: עיצוב פתרון אופטימלי

## 3.1 עקרונות הפתרון

### עקרון 1: Single Source of Truth

**מערכת אחת מרכזית לניהול העדפות**

- `PreferencesManager` - נקודת כניסה אחת לכל פעולות העדפות
- כל המערכות האחרות רק helpers/wrappers
- אין כפילויות

### עקרון 2: Optimistic Updates

**עדכון UI מיד אחרי שמירה, ללא טעינה מחדש**

- אחרי שמירה מוצלחת: עדכון UI עם הערכים שנשמרו
- עדכון מטמון עם הערכים שנשמרו
- רק במקרה של שגיאה: טעינה מחדש מהשרת

### עקרון 3: Smart Cache

**ניהול מטמון חכם עם invalidation מדויק**

- ניקוי מטמון רק כשצריך
- לא טעינה מחדש אחרי כל שמירה
- Cache keys עקביים
- Invalidation patterns אחידים

### עקרון 4: Lazy Loading

**טעינה רק כשצריך**

- טעינה ראשונית: רק critical preferences
- טעינת קבוצות: רק כשפותחים section
- Background loading: רק preferences לא קריטיים

### עקרון 5: Event-Driven

**שימוש ב-events במקום קריאות ישירות**

- Events מוגדרים היטב
- Listeners מינימליים
- Decoupling בין שכבות

## 3.2 ארכיטקטורה מוצעת

### מבנה כללי

```
PreferencesManager (מרכזי)
├── PreferencesData (API layer)
│   └── תקשורת עם Backend בלבד
├── PreferencesCache (Cache layer)
│   └── ניהול מטמון בלבד
├── PreferencesUI (UI layer)
│   └── עדכון UI בלבד
└── PreferencesEvents (Event system)
    └── תקשורת בין שכבות
```

### תפקידים

#### PreferencesManager

**תפקיד:** מנהל מרכזי - נקודת כניסה אחת

**תכונות:**

- `initialize()` - אתחול מערכת
- `loadGroup(groupName)` - טעינת קבוצה
- `saveGroup(groupName, preferences)` - שמירת קבוצה
- `refreshGroup(groupName)` - רענון קבוצה (רק אם צריך)
- `updateField(fieldId, value)` - עדכון אופטימי של שדה

**תלויות:**

- PreferencesData (API)
- PreferencesCache (Cache)
- PreferencesUI (UI)
- PreferencesEvents (Events)

#### PreferencesData

**תפקיד:** תקשורת עם API בלבד

**תכונות:**

- `loadGroupPreferences(groupName, userId, profileId)` - טעינה מהשרת
- `saveGroupPreferences(groupName, preferences, userId, profileId)` - שמירה לשרת
- `getAllPreferences(userId, profileId)` - טעינת כל ההעדפות

**תלויות:**

- אין (רק API calls)

#### PreferencesCache

**תפקיד:** ניהול מטמון בלבד

**תכונות:**

- `get(key, options)` - קריאה מכל השכבות
- `set(key, value, options)` - שמירה לכל השכבות
- `invalidate(pattern)` - ניקוי מטמון (ללא טעינה מחדש!)
- `clearGroup(groupName)` - ניקוי מטמון של קבוצה

**תלויות:**

- UnifiedCacheManager (layer נמוך)

#### PreferencesUI

**תפקיד:** עדכון UI בלבד

**תכונות:**

- `populateGroup(sectionId, preferences)` - מילוי קבוצה
- `updateField(fieldId, value)` - עדכון שדה בודד
- `markFieldAsModified(fieldId)` - סימון שדה כנערך

**תלויות:**

- אין (רק DOM manipulation)

#### PreferencesEvents

**תפקיד:** תקשורת בין שכבות

**תכונות:**

- `dispatch(eventName, detail)` - שליחת event
- `listen(eventName, handler)` - האזנה ל-event

**Events:**

- `preferences:loaded` - העדפות נטענו
- `preferences:saved` - העדפות נשמרו
- `preferences:field-updated` - שדה עודכן
- `preferences:group-updated` - קבוצה עודכנה

**תלויות:**

- אין (רק window events)

## 3.3 תהליך טעינה אופטימלי

### זרימה מוצעת

```
1. PreferencesManager.initialize()
   ↓
2. PreferencesCache.get('preferences_all_...')
   ├── אם יש במטמון → החזר
   └── אם אין במטמון → המשך
   ↓
3. PreferencesData.loadAllPreferences()
   ↓
4. PreferencesCache.set('preferences_all_...', data)
   ↓
5. PreferencesUI.populateGroup(sectionId, data)
   ↓
6. PreferencesEvents.dispatch('preferences:loaded')
```

### Lazy Loading

```
1. PreferencesManager.initialize()
   ↓
2. PreferencesData.loadCriticalPreferences()
   ↓
3. PreferencesUI.populateGroup('critical', data)
   ↓
4. Background: PreferencesData.loadAllPreferences()
```

### פתיחת Section

```
1. User opens section
   ↓
2. PreferencesManager.loadGroup(groupName)
   ↓
3. PreferencesCache.get('preference_group_...')
   ├── אם יש במטמון → החזר + populate
   └── אם אין במטמון → המשך
   ↓
4. PreferencesData.loadGroupPreferences(groupName)
   ↓
5. PreferencesCache.set('preference_group_...', data)
   ↓
6. PreferencesUI.populateGroup(sectionId, data)
```

## 3.4 תהליך שמירה אופטימלי

### זרימה מוצעת (Optimistic Update)

```
1. User saves group
   ↓
2. PreferencesManager.saveGroup(groupName, formData)
   ↓
3. PreferencesData.saveGroupPreferences(groupName, formData)
   ├── אם הצליח → המשך
   └── אם נכשל → rollback + טעינה מחדש
   ↓
4. PreferencesUI.updateFields(formData) - עדכון אופטימי! ✅
   ↓
5. PreferencesCache.set('preference_group_...', formData) - עדכון מטמון
   ↓
6. PreferencesEvents.dispatch('preferences:saved', { groupName, preferences: formData })
   ↓
7. Done! (ללא טעינה מחדש מהשרת!)
```

### Rollback במקרה של שגיאה

```
1. PreferencesData.saveGroupPreferences() נכשל
   ↓
2. PreferencesUI.rollbackFields(formData) - החזרת ערכים ישנים
   ↓
3. PreferencesManager.loadGroup(groupName) - טעינה מחדש מהשרת
   ↓
4. PreferencesEvents.dispatch('preferences:save-failed', { error })
```

## 3.5 ניהול מטמון אופטימלי

### Cache Key Format

**פורמט אחיד:** `preference_{type}_{identifier}_{userId}_{profileId}`

**דוגמאות:**

- `preference_single_atr_period_1_0` - העדפה בודדת
- `preference_group_trading_settings_1_0` - קבוצת העדפות
- `preference_all__1_0` - כל ההעדפות

**יתרונות:**

- קל לזהות מפתחות קשורים
- קל לנקות מטמון של קבוצה
- קל לדבאג

### Invalidation Strategy

**מתי לנקות מטמון:**

1. אחרי שמירה מוצלחת - רק עדכון מטמון (לא ניקוי!)
2. אחרי שגיאה בשמירה - ניקוי + טעינה מחדש
3. אחרי החלפת פרופיל - ניקוי כל המטמון
4. אחרי ניקוי ידני - ניקוי + טעינה מחדש (אם צריך)

**מתי לא לנקות מטמון:**

- אחרי שמירה מוצלחת (רק עדכון!)
- אחרי טעינה רגילה
- אחרי population

### Cache Layers

**סדר בדיקה:**

1. Memory (מהיר ביותר)
2. localStorage (מהיר, persistent)
3. IndexedDB (איטי יותר, persistent, גדול)
4. Backend API (איטי ביותר)

**אסטרטגיה:**

- קריאה: memory → localStorage → IndexedDB → API
- שמירה: memory + localStorage + IndexedDB (כל השכבות)

### TTL (Time To Live)

**ברירת מחדל:** 5 דקות (300,000ms)

**ניתן להגדרה:**

- Critical preferences: 1 דקה
- Group preferences: 5 דקות
- All preferences: 10 דקות

## 3.6 Event System

### Events מוגדרים

#### preferences:loaded

**נשלח:** אחרי טעינת העדפות
**Detail:**

```javascript
{
  userId: number,
  profileId: number,
  preferences: Object,
  source: 'cache' | 'api'
}
```

#### preferences:saved

**נשלח:** אחרי שמירה מוצלחת
**Detail:**

```javascript
{
  groupName: string,
  preferences: Object,
  userId: number,
  profileId: number
}
```

#### preferences:field-updated

**נשלח:** אחרי עדכון שדה בודד
**Detail:**

```javascript
{
  fieldId: string,
  value: any,
  groupName: string
}
```

#### preferences:group-updated

**נשלח:** אחרי עדכון קבוצה
**Detail:**

```javascript
{
  groupName: string,
  updatedKeys: string[],
  userId: number,
  profileId: number
}
```

#### preferences:save-failed

**נשלח:** אחרי שגיאה בשמירה
**Detail:**

```javascript
{
  groupName: string,
  error: Error,
  preferences: Object
}
```

### Event Listeners

**מינימליים:**

- רק listeners שצריכים לעדכן UI
- לא listeners שטוענים מחדש מהשרת
- לא listeners שמפעילים population

## 3.7 API Specifications

### PreferencesManager API

```javascript
class PreferencesManager {
  // Initialization
  async initialize(userId, profileId): Promise<void>
  
  // Loading
  async loadGroup(groupName, options?): Promise<Object>
  async loadAllGroups(options?): Promise<Object>
  
  // Saving
  async saveGroup(groupName, preferences, options?): Promise<Object>
  async saveField(fieldName, value, options?): Promise<boolean>
  
  // Refreshing
  async refreshGroup(groupName, force?): Promise<Object>
  
  // Cache
  invalidateCache(pattern?): Promise<void>
  clearCache(): Promise<void>
}
```

### PreferencesCache API

```javascript
class PreferencesCache {
  // Getting
  async get(key, options?): Promise<any>
  
  // Setting
  async set(key, value, options?): Promise<void>
  
  // Invalidation
  async invalidate(pattern): Promise<void>
  async clearGroup(groupName): Promise<void>
  async clearAll(): Promise<void>
  
  // Utilities
  buildKey(type, identifier, userId, profileId): string
  parseKey(key): { type, identifier, userId, profileId }
}
```

### PreferencesUI API

```javascript
class PreferencesUI {
  // Population
  populateGroup(sectionId, preferences): void
  populateField(fieldId, value): void
  
  // Updates
  updateField(fieldId, value): void
  updateFields(fields): void
  
  // State
  markFieldAsModified(fieldId): void
  clearFieldModification(fieldId): void
  isFieldModified(fieldId): boolean
}
```

## 3.8 Migration Plan

### שלב 1: יצירת PreferencesManager

- יצירת PreferencesManager class
- יצירת PreferencesCache class
- יצירת PreferencesEvents class
- יצירת PreferencesUI class (wrapper)

### שלב 2: Integration

- עדכון PreferencesGroupManager להשתמש ב-PreferencesManager
- עדכון PreferencesUIV4 להשתמש ב-PreferencesManager
- שמירה על backward compatibility

### שלב 3: Optimization

- הסרת טעינות מיותרות
- איחוד population
- אופטימיזציה של מטמון

### שלב 4: Cleanup

- הסרת קוד מיותר
- איחוד מערכות מקבילות
- תיעוד

## 3.9 Backward Compatibility

### Wrappers

**PreferencesUI (legacy):**

```javascript
window.PreferencesUI = {
  loadAllPreferences: (userId, profileId) => {
    return PreferencesManager.loadAllGroups({ userId, profileId });
  },
  saveGroup: (groupName) => {
    return PreferencesManager.saveGroup(groupName, formData);
  }
};
```

**PreferencesGroupManager (existing):**

```javascript
// שימוש ב-PreferencesManager פנימית
// API חיצוני נשאר זהה
```

## סיכום

**עקרונות:** 5
**שכבות:** 4 (Manager, Data, Cache, UI, Events)
**תהליכים:** 3 (טעינה, שמירה, מטמון)
**Events:** 5

**יתרונות:**

- נקודת כניסה אחת
- Optimistic updates
- ניהול מטמון יעיל
- Event-driven architecture
- Backward compatible

