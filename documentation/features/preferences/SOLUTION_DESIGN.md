# עיצוב פתרון אופטימלי - מערכת העדפות v3.0

**גרסה:** 3.0.0  
**תאריך עדכון:** 23 בדצמבר 2025  
**ארכיטקטורה:** Backend-First Architecture

## שלב 3: עיצוב פתרון אופטימלי

## 3.1 עקרונות הפתרון

### עקרון 1: Backend-First Architecture (חדש - v3.0)

**השרת אחראי לספק מידע מלא ומלא על כל העדפה**

- **Backend אחראי:** השרת מחזיר תמיד ערך תקין לכל העדפה מבוקשת
- **היררכיית ערכים:** שמור → `PreferenceType.default_value` → `DEFAULT_PREFERENCES` fallback
- **Frontend פשוט:** Frontend לא מטפל בברירות מחדל, רק משתמש בערכים שהשרת מחזיר
- **Single Source of Truth:** השרת הוא המקור היחיד לאמת - כל הערכים מגיעים משם

**יתרונות:**
- אין בלבול בין Frontend ל-Backend על מה זמין ומה לא
- עקביות מלאה - כל העדפות תמיד זמינות
- Frontend פשוט יותר - פחות לוגיקה עסקית
- תחזוקה קלה - שינוי ברירת מחדל במקום אחד בלבד

### עקרון 2: Single Source of Truth

**מערכת אחת מרכזית לניהול העדפות**

- `PreferencesCore` - נקודת כניסה אחת לכל פעולות העדפות
- כל המערכות האחרות רק helpers/wrappers
- אין כפילויות

### עקרון 3: Optimistic Updates

**עדכון UI מיד אחרי שמירה, ללא טעינה מחדש**

- אחרי שמירה מוצלחת: עדכון UI עם הערכים שנשמרו
- עדכון מטמון עם הערכים שנשמרו
- רק במקרה של שגיאה: טעינה מחדש מהשרת

### עקרון 4: Smart Cache

**ניהול מטמון חכם עם invalidation מדויק**

- ניקוי מטמון רק כשצריך
- לא טעינה מחדש אחרי כל שמירה
- Cache keys עקביים
- Invalidation patterns אחידים

### עקרון 5: Lazy Loading

**טעינה רק כשצריך**

- טעינה ראשונית: רק critical preferences
- טעינת קבוצות: רק כשפותחים section
- Background loading: רק preferences לא קריטיים

### עקרון 6: Event-Driven

**שימוש ב-events במקום קריאות ישירות**

- Events מוגדרים היטב
- Listeners מינימליים
- Decoupling בין שכבות

## 3.2 ארכיטקטורה מוצעת (v3.0 - Backend-First)

### מבנה כללי

```
Backend (Single Source of Truth)
├── PreferencesService.get_preferences_by_names()
│   ├── מחזיר תמיד ערך תקין לכל העדפה מבוקשת
│   ├── היררכיית ערכים: שמור → PreferenceType.default_value → DEFAULT_PREFERENCES fallback
│   └── _get_fallback_default() - מקור מרכזי לברירות מחדל
├── PreferenceType.default_value
│   └── ברירות מחדל מטבלת PreferenceType (מסד הנתונים)
└── DEFAULT_PREFERENCES / COLOR_DEFAULTS
    └── ברירות מחדל hardcoded (fallback אחרון)

Frontend (Simple Consumer)
├── PreferencesCore (מרכזי)
│   ├── PreferencesData (API layer)
│   │   └── תקשורת עם Backend בלבד - משתמש בערכים שהשרת מחזיר
│   │   └── לא מטפל בברירות מחדל - רק משתמש בערכים מהשרת
│   ├── PreferencesCache (Cache layer)
│   │   └── ניהול מטמון בלבד (4 שכבות: Memory → localStorage → IndexedDB → Backend)
│   ├── PreferencesUI (UI layer)
│   │   └── עדכון UI בלבד - לא מטפל בברירות מחדל
│   └── PreferencesEvents (Event system)
│       └── תקשורת בין שכבות
```

### תפקידים

#### Backend - PreferencesService

**תפקיד:** Single Source of Truth - השרת אחראי לספק מידע מלא

**תכונות:**

- `get_preferences_by_names()` - מחזיר תמיד ערך תקין לכל העדפה מבוקשת
- `get_preference()` - מחזיר ערך בודד עם היררכיית ערכים
- `get_group_preferences()` - מחזיר קבוצת העדפות עם ערכים תקינים
- `_get_fallback_default()` - מקור מרכזי לברירות מחדל

**היררכיית ערכים (Backend):**

1. **שמור** - `UserPreference.saved_value` (אם קיים)
2. **ברירת מחדל מטבלה** - `PreferenceType.default_value` (אם קיים)
3. **Fallback** - `DEFAULT_PREFERENCES` או `COLOR_DEFAULTS` (אם קיים)
4. **None** - רק אם אין שום ברירת מחדל

**עקרון:** השרת **תמיד** מחזיר ערך תקין (או None רק אם אין ברירת מחדל בכלל)

#### Frontend - PreferencesCore

**תפקיד:** מנהל מרכזי - נקודת כניסה אחת

**תכונות:**

- `initializeWithLazyLoading()` - אתחול מערכת עם lazy loading
- `getPreference(name)` - קבלת העדפה (מהשרת או cache)
- `savePreference(name, value)` - שמירת העדפה
- `saveGroupPreferences(groupName, preferences)` - שמירת קבוצה

**תלויות:**

- PreferencesData (API)
- PreferencesCache (Cache)
- PreferencesUI (UI)
- PreferencesEvents (Events)

**עקרון:** Frontend **לא מטפל** בברירות מחדל - רק משתמש בערכים שהשרת מחזיר

#### PreferencesData

**תפקיד:** תקשורת עם API בלבד

**תכונות:**

- `loadPreferencesByNames(names)` - טעינה מהשרת (מחזיר ערכים תקינים)
- `savePreference(name, value)` - שמירה לשרת
- `loadAllPreferences()` - טעינת כל ההעדפות (מהשרת או cache)

**תלויות:**

- אין (רק API calls)

**עקרון:** לא מטפל בברירות מחדל - השרת כבר מחזיר ערכים תקינים

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
1. PreferencesCore.initializeWithLazyLoading()
   ↓
2. PreferencesCache.get('preference_all_u1_p0')
   ├── אם יש במטמון → החזר (כבר מכיל ערכים תקינים מהשרת)
   └── אם אין במטמון → המשך
   ↓
3. PreferencesData.loadPreferencesByNames(allNames)
   ↓
4. Backend: PreferencesService.get_preferences_by_names()
   ├── טען PreferenceType
   ├── טען UserPreference.saved_value
   └── החזר ערך תקין: שמור → default_value → fallback ✅
   ↓
5. PreferencesCache.set('preference_all_u1_p0', data) - שמירה במטמון
   ↓
6. PreferencesUI.populateGroup(sectionId, data) - מילוי UI
   ↓
7. PreferencesEvents.dispatch('preferences:loaded')
```

**הערה חשובה:** השרת מחזיר תמיד ערכים תקינים, Frontend לא צריך לטפל בברירות מחדל!

### Lazy Loading (v3.0)

```
1. PreferencesCore.initializeWithLazyLoading(userId, profileId)
   ↓
2. LazyLoader.initialize(userId, profileId)
   ├── טען critical preferences (18 העדפות)
   │   └── Backend מחזיר ערכים תקינים ✅
   ├── טען high priority preferences (17 העדפות)
   │   └── Backend מחזיר ערכים תקינים ✅
   ├── טען medium priority preferences (23 העדפות) - background
   │   └── Backend מחזיר ערכים תקינים ✅
   └── טען low priority preferences (14 העדפות) - background
       └── Backend מחזיר ערכים תקינים ✅
   ↓
3. PreferencesUI.populateGroup(sectionId, data) - רק critical + high
   ↓
4. Background: טעינת medium + low priorities
```

**הערה:** כל העדפות נטענות מהשרת עם ערכים תקינים - אין צורך בטיפול בברירות מחדל ב-Frontend!

### פתיחת Section (v3.0)

```
1. User opens section
   ↓
2. PreferencesGroupManager.loadGroup(groupName)
   ↓
3. PreferencesCache.get('preference_group_...')
   ├── אם יש במטמון → החזר + populate (כבר מכיל ערכים תקינים)
   └── אם אין במטמון → המשך
   ↓
4. PreferencesData.loadPreferencesByNames(groupNames)
   ↓
5. Backend: PreferencesService.get_preferences_by_names()
   ├── החזר ערכים תקינים: שמור → default_value → fallback ✅
   ↓
6. PreferencesCache.set('preference_group_...', data)
   ↓
7. PreferencesUI.populateGroup(sectionId, data)
```

**הערה:** השרת מחזיר תמיד ערכים תקינים - אין צורך בטיפול בברירות מחדל ב-Frontend!

## 3.4 תהליך שמירה אופטימלי

### זרימה מוצעת (Optimistic Update)

```
1. User saves group
   ↓
2. PreferencesGroupManager.saveGroup(groupName)
   ↓
3. PreferencesCore.saveGroupPreferences(groupName, formData)
   ↓
4. PreferencesData.savePreferences(formData)
   ↓
5. Backend: PreferencesService.save_preferences()
   ├── שמירה ל-UserPreference
   ├── החזרת profile_id שנשמר (resolved)
   └── אם הצליח → המשך
   └── אם נכשל → rollback + טעינה מחדש
   ↓
6. PreferencesCache.update() - עדכון מטמון עם הערכים שנשמרו ✅
   ↓
7. PreferencesUI.updateFields(formData) - עדכון אופטימי! ✅
   ↓
8. PreferencesEvents.dispatch('preferences:saved', { groupName, preferences: formData })
   ↓
9. Done! (ללא טעינה מחדש מהשרת!)
```

**הערה חשובה:** אחרי שמירה מוצלחת, המטמון מתעדכן עם הערכים שנשמרו. אין צורך בטעינה מחדש מהשרת כי השרת כבר החזיר את הערכים הנכונים.

### Rollback במקרה של שגיאה

```
1. PreferencesData.savePreferences() נכשל
   ↓
2. PreferencesUI.rollbackFields(formData) - החזרת ערכים ישנים
   ↓
3. PreferencesCore.getPreference(name) - טעינה מחדש מהשרת (עם ערכים תקינים)
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

## 3.7 API Specifications (v3.0)

### Backend API - PreferencesService

```python
class PreferencesService:
    def get_preferences_by_names(
        self,
        user_id: int,
        names: List[str],
        profile_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        מחזיר תמיד ערך תקין לכל העדפה מבוקשת
        היררכיה: שמור → PreferenceType.default_value → DEFAULT_PREFERENCES fallback
        """
        # מחזיר Dict[str, Any] - כל העדפות עם ערכים תקינים
        
    def get_preference(
        self,
        user_id: int,
        preference_name: str,
        profile_id: Optional[int] = None
    ) -> Any:
        """
        מחזיר ערך בודד עם היררכיית ערכים
        """
        # מחזיר ערך תקין או None (רק אם אין ברירת מחדל בכלל)
        
    def _get_fallback_default(self, preference_name: str) -> Any:
        """
        מקור מרכזי לברירות מחדל
        Single source of truth for default values
        """
        # 1. נסה מ-DEFAULT_PREFERENCES
        # 2. נסה לפי סוג העדפה (אם זה צבע)
        # 3. ברירת מחדל גנרית (None)
```

### Frontend API - PreferencesCore

```javascript
class PreferencesCore {
  // Initialization
  async initializeWithLazyLoading(userId?, profileId?): Promise<void>
  
  // Loading (מהשרת או cache - השרת מחזיר ערכים תקינים)
  async getPreference(name, userId?, profileId?): Promise<any>
  async getAllPreferences(userId?, profileId?): Promise<Object>
  
  // Saving
  async savePreference(name, value, userId?, profileId?): Promise<Object>
  async saveGroupPreferences(groupName, preferences, userId?, profileId?): Promise<Object>
  
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

## 3.8 Migration Plan (v3.0 - הושלם)

### שלב 1: Backend-First Architecture ✅

- ✅ עדכון `PreferencesService.get_preferences_by_names()` להחזיר תמיד ערכים תקינים
- ✅ הוספת `_get_fallback_default()` - מקור מרכזי לברירות מחדל
- ✅ הוספת `COLOR_DEFAULTS` ל-`DEFAULT_PREFERENCES`
- ✅ עדכון `get_preference()` ו-`get_group_preferences()` להחזיר ערכים תקינים

### שלב 2: Frontend Simplification ✅

- ✅ הסרת לוגיקה עסקית מ-`preferences-core.js`
- ✅ הסרת לוגיקה עסקית מ-`preferences-colors.js`
- ✅ הסרת לוגיקה עסקית מ-`preferences-ui-v4.js`
- ✅ הסרת לוגיקה עסקית מ-`select-populator-service.js`
- ✅ Frontend משתמש רק בערכים שהשרת מחזיר

### שלב 3: Cache Integration ✅

- ✅ עדכון cache עם `profile_id` שנשמר (resolved)
- ✅ עדכון cache אחרי שמירה (לא רק invalidation)
- ✅ תיקון רקורסיה ב-`getCurrentPreference`

### שלב 4: Documentation ✅

- ✅ עדכון `SOLUTION_DESIGN.md` עם הארכיטקטורה החדשה
- ✅ העברת קבצי תעוד ישנים לארכיון
- ✅ עדכון מניפסט החבילות

## 3.9 Backward Compatibility

### Wrappers

**PreferencesUI (legacy):**

```javascript
window.PreferencesUI = {
  loadAllPreferences: (userId, profileId) => {
    return PreferencesCore.getAllPreferences(userId, profileId);
  },
  saveGroup: (groupName) => {
    return PreferencesCore.saveGroupPreferences(groupName, formData);
  }
};
```

**PreferencesGroupManager (existing):**

```javascript
// שימוש ב-PreferencesCore פנימית
// API חיצוני נשאר זהה
```

## סיכום (v3.0)

**עקרונות:** 6 (כולל Backend-First Architecture)
**שכבות:** 2 (Backend + Frontend)
**תהליכים:** 3 (טעינה, שמירה, מטמון)
**Events:** 5

**יתרונות:**

- ✅ **Backend-First Architecture** - Single Source of Truth בשרת
- ✅ **Frontend פשוט** - לא מטפל בברירות מחדל
- ✅ **עקביות מלאה** - כל העדפות תמיד זמינות
- ✅ **תחזוקה קלה** - שינוי ברירת מחדל במקום אחד בלבד
- ✅ **Optimistic updates** - עדכון UI מיד אחרי שמירה
- ✅ **ניהול מטמון יעיל** - 4 שכבות (Memory → localStorage → IndexedDB → Backend)
- ✅ **Event-driven architecture** - תקשורת בין שכבות
- ✅ **Backward compatible** - תמיכה ב-API ישן

**קבצים מרכזיים:**

- **Backend:** `Backend/services/preferences_service.py` - Single Source of Truth
- **Frontend:** `trading-ui/scripts/preferences-core.js` - מנהל מרכזי
- **Cache:** `trading-ui/scripts/preferences-cache.js` - ניהול מטמון
- **UI:** `trading-ui/scripts/preferences-ui-v4.js` - ממשק משתמש

