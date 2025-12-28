# מטריצת פתרון בעיות - מערכת העדפות v3.0

**גרסה:** 3.0.0  
**תאריך עדכון:** 23 בדצמבר 2025

## תוכן עניינים

1. [בעיות נפוצות](#בעיות-נפוצות)
2. [שגיאות Backend](#שגיאות-backend)
3. [שגיאות Frontend](#שגיאות-frontend)
4. [בעיות מטמון](#בעיות-מטמון)
5. [בעיות פרופילים](#בעיות-פרופילים)
6. [בעיות UI](#בעיות-ui)
7. [בעיות ביצועים](#בעיות-ביצועים)

---

## בעיות נפוצות

### בעיה: העדפה לא נטענת

**תסמינים:**
- העדפה מחזירה `null` או `undefined`
- ערך ברירת מחדל לא מוצג

**סיבות אפשריות:**
1. העדפה לא קיימת ב-`PreferenceType`
2. `profile_id` שגוי
3. מטמון פגום
4. שגיאת API

**פתרונות:**

```javascript
// 1. בדוק אם העדפה קיימת
const exists = await window.PreferencesCore.checkPreferenceExists('preference_name');
console.log('קיימת:', exists);

// 2. בדוק profile_id
const profileContext = await window.PreferencesCore.getLatestProfileContext();
console.log('Profile ID:', profileContext?.profile_id);

// 3. נקה מטמון וטען מחדש
await window.PreferencesCore.clearCache();
const value = await window.PreferencesCore.getPreference('preference_name', 1, 0);

// 4. בדוק שגיאת API
try {
  const value = await window.PreferencesCore.getPreference('preference_name', 1, 0);
} catch (error) {
  console.error('שגיאת API:', error);
}
```

**Backend:**

```python
# בדוק אם העדפה קיימת ב-PreferenceType
from Backend.models.preferences import PreferenceType
pref_type = session.query(PreferenceType).filter(
    PreferenceType.preference_name == 'preference_name'
).first()

if not pref_type:
    # הוסף ל-PreferenceType או השתמש ב-fallback
    pass
```

---

### בעיה: העדפה לא נשמרת

**תסמינים:**
- שמירה נראית מוצלחת אבל הערך לא משתנה
- אחרי refresh הערך חוזר לערך הקודם

**סיבות אפשריות:**
1. `profile_id` שגוי (ForeignKeyViolation)
2. שגיאת validation
3. מטמון לא מתעדכן
4. שגיאת API

**פתרונות:**

```javascript
// 1. בדוק שגיאת שמירה
try {
  const result = await window.PreferencesCore.savePreference('preference_name', 'value', 1, 0);
  console.log('תוצאה:', result);
  
  if (!result.success) {
    console.error('שגיאה:', result.error);
  }
} catch (error) {
  console.error('שגיאה בשמירה:', error);
}

// 2. בדוק profile_id שנשמר
const result = await window.PreferencesCore.savePreference('preference_name', 'value', 1, null);
console.log('Profile ID שנשמר:', result.profile_id);

// 3. עדכן מטמון ידנית
await window.PreferencesCore.savePreference('preference_name', 'value', 1, 0);
// המטמון מתעדכן אוטומטית, אבל אפשר לבדוק:
const cached = await window.UnifiedCacheManager.get('preference_preference_name_1_0');
console.log('מטמון:', cached);

// 4. בדוק validation
const validationManager = window.PreferencesCore.validationManager;
const isValid = validationManager.validatePreference('preference_name', 'value');
console.log('תקין:', isValid);
```

**Backend:**

```python
# בדוק ForeignKeyViolation
try:
    service.save_preference(1, 'preference_name', 'value', profile_id=999)
except ForeignKeyViolation:
    # profile_id לא קיים - צריך ליצור פרופיל או להשתמש ב-active profile
    profile_id = service._get_active_profile_id(session, user_id)
    service.save_preference(1, 'preference_name', 'value', profile_id=profile_id)
```

---

### בעיה: רקורסיה ב-getPreference

**תסמינים:**
- `🚨 RECURSION DETECTED in getPreference`
- לולאה אינסופית
- דפדפן קופא

**סיבות אפשריות:**
1. `getPreference()` קורא ל-`Logger` שבתורו קורא ל-`getPreference()`
2. `getCurrentPreference()` קורא ל-`getPreference()` בזמן ש-`getPreference()` כבר רץ

**פתרונות:**

```javascript
// 1. בדוק call stack
console.log('Call stack:', window.__GET_PREFERENCE_CALL_STACK__);

// 2. בדוק flag
console.log('In progress:', window.__GET_PREFERENCE_IN_PROGRESS__);

// 3. השתמש ב-getCurrentPreference במקום getPreference
// getCurrentPreference בודק את window.currentPreferences לפני קריאה ל-getPreference
const value = await window.getCurrentPreference('preference_name', {
  userId: 1,
  profileId: 0
});

// 4. נקה call stack
window.__GET_PREFERENCE_CALL_STACK__ = [];
window.__GET_PREFERENCE_IN_PROGRESS__ = false;
```

**תיקון:**

```javascript
// ב-preferences-core.js
window.getCurrentPreference = async function(preferenceName, options = {}) {
  // First, check if the preference is already in the globally loaded preferences
  if (window.currentPreferences && Object.prototype.hasOwnProperty.call(window.currentPreferences, preferenceName)) {
    const currentValue = window.currentPreferences[preferenceName];
    if (currentValue !== undefined) {
      return currentValue;
    }
  }

  // Prevent recursion if getPreference is already in progress
  if (window.__GET_PREFERENCE_IN_PROGRESS__) {
    return null; // Or handle with a fallback value
  }

  // Now safe to call getPreference
  return await window.PreferencesCore.getPreference(preferenceName, userId, profileId);
};
```

---

## שגיאות Backend

### שגיאה: ForeignKeyViolation

**תסמינים:**
```
(psycopg2.errors.ForeignKeyViolation) insert or update on table "user_preferences" 
violates foreign key constraint "user_preferences_profile_id_fkey"
DETAIL: Key (profile_id)=(88922) is not present in table "preference_profiles".
```

**סיבה:**
`profile_id` שנשלח מהצד לקוח לא קיים בטבלת `preference_profiles`.

**פתרון:**

```python
# ב-PreferencesService.save_preferences()
# אם profile_id הוא None, השתמש ב-active profile
if profile_id is None:
    profile_id = self._get_active_profile_id(session, user_id)
```

**Frontend:**

```javascript
// שלח null ל-profile_id כדי שהשרת יפתור את ה-active profile
const result = await window.PreferencesCore.savePreference('preference_name', 'value', 1, null);
// השרת יחזיר את ה-profile_id שנשמר
console.log('Profile ID שנשמר:', result.profile_id);
```

---

### שגיאה: Preference לא קיים ב-PreferenceType

**תסמינים:**
- `ValidationError: Preference 'preference_name' not found`
- העדפה לא מוחזרת ב-`get_preferences_by_names()`

**סיבה:**
העדפה לא קיימת בטבלת `PreferenceType`.

**פתרון:**

```python
# הוסף ל-PreferenceType
from Backend.models.preferences import PreferenceType, PreferenceGroup

# מצא קבוצה
group = session.query(PreferenceGroup).filter(
    PreferenceGroup.group_name == 'trading_settings'
).first()

# הוסף העדפה
pref_type = PreferenceType(
    preference_name='new_preference',
    group_id=group.id,
    data_type='string',
    default_value='default',
    description='New preference description',
    is_active=True
)
session.add(pref_type)
session.commit()
```

**או השתמש ב-fallback:**

```python
# ב-PreferencesService._get_fallback_default()
# אם העדפה לא ב-PreferenceType, השתמש ב-DEFAULT_PREFERENCES
if preference_name in DEFAULT_PREFERENCES:
    return DEFAULT_PREFERENCES[preference_name]
```

---

### שגיאה: ערך לא תקין (Validation)

**תסמינים:**
- `ValidationError: Invalid value for preference`
- שמירה נכשלת

**סיבה:**
ערך לא עומד ב-constraints של העדפה.

**פתרון:**

```python
# בדוק constraints
from Backend.services.constraint_service import ConstraintService

constraint_service = ConstraintService()
is_valid = constraint_service.validate_value(
    preference_name='atr_period',
    value=20,
    data_type='number',
    constraints={'min': 1, 'max': 100}
)

if not is_valid:
    raise ValidationError('Value does not meet constraints')
```

---

## שגיאות Frontend

### שגיאה: PreferencesCore לא זמין

**תסמינים:**
- `TypeError: window.PreferencesCore is undefined`
- `Cannot read property 'getPreference' of undefined`

**סיבה:**
הסקריפט `preferences-core.js` לא נטען או נטען מאוחר מדי.

**פתרון:**

```javascript
// בדוק אם PreferencesCore זמין
if (!window.PreferencesCore) {
  console.error('PreferencesCore לא זמין - בדוק שהסקריפט נטען');
  // המתן לטעינה
  await new Promise(resolve => {
    const checkInterval = setInterval(() => {
      if (window.PreferencesCore) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);
  });
}

// או השתמש ב-UnifiedAppInitializer
await window.initializeUnifiedApp();
// PreferencesCore יהיה זמין אחרי האתחול
```

---

### שגיאה: מטמון לא מתעדכן

**תסמינים:**
- ערך ישן מוצג גם אחרי שמירה
- אחרי refresh הערך החדש מוצג

**סיבה:**
מטמון לא מתעדכן אחרי שמירה.

**פתרון:**

```javascript
// 1. בדוק אם המטמון מתעדכן
const result = await window.PreferencesCore.savePreference('preference_name', 'value', 1, 0);
console.log('תוצאה:', result);

// 2. בדוק מטמון ידנית
const cacheKey = 'preference_preference_name_1_0';
const cached = await window.UnifiedCacheManager.get(cacheKey);
console.log('מטמון:', cached);

// 3. עדכן מטמון ידנית אם צריך
if (result.success) {
  await window.UnifiedCacheManager.save(cacheKey, result.value, {
    layer: 'localStorage',
    ttl: 300000
  });
}

// 4. נקה מטמון וטען מחדש
await window.PreferencesCore.invalidatePreference('preference_name', 1, 0);
const value = await window.PreferencesCore.getPreference('preference_name', 1, 0);
```

---

### שגיאה: רקורסיה ב-getCurrentPreference

**תסמינים:**
- `🚨 RECURSION DETECTED in getPreference`
- לולאה אינסופית

**סיבה:**
`getCurrentPreference()` קורא ל-`getPreference()` בזמן ש-`getPreference()` כבר רץ.

**פתרון:**

```javascript
// השתמש ב-window.currentPreferences ישירות
if (window.currentPreferences && window.currentPreferences['preference_name']) {
  return window.currentPreferences['preference_name'];
}

// או בדוק flag לפני קריאה
if (!window.__GET_PREFERENCE_IN_PROGRESS__) {
  return await window.PreferencesCore.getPreference('preference_name', 1, 0);
} else {
  return null; // או fallback value
}
```

---

## בעיות מטמון

### בעיה: מטמון פגום

**תסמינים:**
- ערכים לא נכונים מוצגים
- אחרי ניקוי מטמון הכל עובד

**פתרון:**

```javascript
// נקה מטמון
await window.PreferencesCore.clearCache();

// או נקה מטמון ספציפי
await window.PreferencesCore.invalidatePreference('preference_name', 1, 0);

// טען מחדש
const value = await window.PreferencesCore.getPreference('preference_name', 1, 0);
```

---

### בעיה: מטמון לא נשמר

**תסמינים:**
- אחרי refresh הערכים נעלמים
- מטמון localStorage ריק

**פתרון:**

```javascript
// בדוק אם UnifiedCacheManager initialized
if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
  console.error('UnifiedCacheManager לא initialized');
  // המתן לאתחול
  await window.UnifiedCacheManager.initialize();
}

// בדוק שמירה
const cacheKey = 'preference_preference_name_1_0';
await window.UnifiedCacheManager.save(cacheKey, 'value', {
  layer: 'localStorage',
  ttl: 300000
});

// בדוק קריאה
const cached = await window.UnifiedCacheManager.get(cacheKey);
console.log('מטמון:', cached);
```

---

## בעיות פרופילים

### בעיה: פרופיל לא פעיל

**תסמינים:**
- העדפות לא נטענות
- `ProfileNotFoundError`

**פתרון:**

```javascript
// בדוק פרופילים
const profiles = await window.PreferencesData.loadProfiles({ userId: 1 });
console.log('פרופילים:', profiles);

// מצא פרופיל פעיל
const activeProfile = profiles.find(p => p.is_active);
console.log('פרופיל פעיל:', activeProfile);

// הפעל פרופיל
if (!activeProfile) {
  await window.PreferencesData.activateProfile({
    profileId: 0, // פרופיל ברירת מחדל
    userId: 1
  });
}
```

---

### בעיה: החלפת פרופיל לא עובדת

**תסמינים:**
- אחרי החלפת פרופיל העדפות לא משתנות
- ערכים ישנים מוצגים

**פתרון:**

```javascript
// הפעל פרופיל
const result = await window.PreferencesData.activateProfile({
  profileId: 1,
  userId: 1
});

if (result.success) {
  // נקה מטמון
  await window.PreferencesCore.clearCache();
  
  // אתחל מחדש
  await window.PreferencesCore.initializeWithLazyLoading(1, 1);
  
  // טען העדפות מחדש
  const preferences = await window.PreferencesCore.getAllPreferences(1, 1);
  console.log('העדפות חדשות:', preferences);
}
```

---

## בעיות UI

### בעיה: שדות לא מתמלאים

**תסמינים:**
- שדות ריקים אחרי טעינה
- ערכים לא מוצגים

**פתרון:**

```javascript
// בדוק אם PreferencesUI זמין
if (!window.PreferencesUI || !window.PreferencesUIV4) {
  console.error('PreferencesUI לא זמין');
  return;
}

// טען העדפות
const preferences = await window.PreferencesCore.getAllPreferences(1, 0);

// מלא שדות ידנית
window.PreferencesUIV4.populateAllFormFields(preferences);

// או השתמש ב-PreferencesGroupManager
const groupManager = window.PreferencesGroupManager;
await groupManager.loadGroup('trading_settings');
```

---

### בעיה: צבעים לא מוצגים

**תסמינים:**
- color pickers שחורים
- צבעי ברירת מחדל לא מוצגים

**פתרון:**

```javascript
// בדוק אם ColorManager זמין
if (!window.ColorManager) {
  console.error('ColorManager לא זמין');
  return;
}

// טען צבעים
const colors = await window.ColorManager.loadAllColors(1, 0);
console.log('צבעים:', colors);

// בדוק אם יש ערכים
if (!colors || Object.keys(colors).length === 0) {
  // השתמש ב-defaultColors
  const defaultColors = window.ColorManager.defaultColors;
  console.log('צבעי ברירת מחדל:', defaultColors);
}

// עדכן UI
window.PreferencesUIV4.populateAllFormFields(colors);
```

---

## בעיות ביצועים

### בעיה: טעינה איטית

**תסמינים:**
- עמוד נטען לאט
- הרבה קריאות API

**פתרון:**

```javascript
// השתמש ב-lazy loading
await window.PreferencesCore.initializeWithLazyLoading(1, 0);

// טען רק critical preferences מיד
const criticalPrefs = await window.PreferencesCore.getAllPreferences(1, 0, [
  'atr_period',
  'default_trading_account'
]);

// טען שאר ההעדפות ב-background
setTimeout(async () => {
  await window.PreferencesCore.getAllPreferences(1, 0);
}, 1000);
```

---

### בעיה: יותר מדי קריאות API

**תסמינים:**
- מאות קריאות API בטעינת עמוד
- rate limiting

**פתרון:**

```javascript
// השתמש ב-batch loading
const preferenceNames = ['atr_period', 'default_trading_account', 'primaryColor'];
const preferences = await window.PreferencesData.loadPreferencesByNames({
  names: preferenceNames,
  userId: 1,
  profileId: 0
});

// במקום קריאות נפרדות:
// ❌ רע
const pref1 = await window.PreferencesCore.getPreference('atr_period', 1, 0);
const pref2 = await window.PreferencesCore.getPreference('default_trading_account', 1, 0);
const pref3 = await window.PreferencesCore.getPreference('primaryColor', 1, 0);

// ✅ טוב
const prefs = await window.PreferencesData.loadPreferencesByNames({
  names: ['atr_period', 'default_trading_account', 'primaryColor'],
  userId: 1,
  profileId: 0
});
```

---

## בעיות בדיקות מקומיות

### בעיה: סקריפט אימות העדפות נכשל עם `DATABASE_URL is not configured`

**תסמינים:**
- שגיאה על `POSTGRES_HOST`/`DATABASE_URL` חסר

**פתרון:**
- הרץ עם משתני PostgreSQL מוגדרים
- או השתמש ב-`start_server.sh` שמגדיר אותם

### בעיה: בדיקת Selenium נכשלת בהורדת WebDriver

**תסמינים:**
- `Could not reach host. Are you offline?`
- כישלון בהקמת driver

**פתרון:**
- ודא גישה לרשת להורדת driver
- ודא ש-Firefox/Chrome מותקנים

---

### בעיה: `GET /api/preferences/default` מחזיר 404 עבור `default_trading_account` או `primaryCurrency`

**תסמינים:**
- תשובת API: `Preference 'default_trading_account' not found`
- תשובת API: `Preference 'primaryCurrency' not found`

**פתרון:**
- ודא שהשרת רץ עם אותו DB שבו הוספת את ה‑preferences.
- בצע restart לשרת עם `start_server.sh` כדי לטעון את ה‑DB העדכני.
- אמת שההעדפות קיימות ב־`preference_types` עם `is_active = true`.

---

## סיכום

### Checklist לפתרון בעיות

1. ✅ בדוק אם השרת מחזיר ערכים תקינים
2. ✅ בדוק אם `profile_id` תקין
3. ✅ בדוק אם מטמון מתעדכן
4. ✅ בדוק אם יש רקורסיה
5. ✅ בדוק אם PreferencesCore זמין
6. ✅ בדוק אם UI מתעדכן
7. ✅ בדוק אם יש שגיאות ב-console

### קישורים שימושיים

- `documentation/04-FEATURES/CORE/preferences/PREFERENCES_COMPLETE_DEVELOPER_GUIDE.md` - מדריך מפתחים מלא
- `documentation/features/preferences/SOLUTION_DESIGN.md` - עיצוב פתרון אופטימלי
- `Backend/services/preferences_service.py` - שירות Backend
- `trading-ui/scripts/preferences-core.js` - מנהל Frontend
