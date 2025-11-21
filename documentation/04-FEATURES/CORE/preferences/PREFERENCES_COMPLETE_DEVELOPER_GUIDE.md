# Preferences System - Complete Developer Guide
## מדריך מפתחים מלא - מערכת העדפות TikTrack

**גרסה:** 4.0  
**תאריך עדכון:** 15 בנובמבר 2025  
**סטטוס:** ✅ Production Ready - מערכת מלאה עם V4, Profiles, Debug Monitor

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [ארכיטקטורה ומבנה](#ארכיטקטורה-ומבנה)
3. [ממשקים ותרחישי שימוש](#ממשקים-ותרחישי-שימוש)
4. [מדריך API](#מדריך-api)
5. [מדריך Frontend](#מדריך-frontend)
6. [ניהול פרופילים](#ניהול-פרופילים)
7. [מערכת צבעים](#מערכת-צבעים)
8. [Cache ומטמון](#cache-ומטמון)
9. [Debugging וניטור](#debugging-וניטור)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 סקירה כללית

מערכת ההעדפות של TikTrack היא מערכת גמישה ומתקדמת לניהול העדפות משתמשים עם תמיכה בפרופילים מרובים, מטמון רב-שכבתי, ואינטגרציה מלאה עם כל המערכות.

### תכונות מרכזיות:
- ✅ **פרופילים מרובים** - כל משתמש יכול ליצור מספר פרופילים
- ✅ **מטמון רב-שכבתי** - Memory, localStorage, IndexedDB, Backend
- ✅ **V4 System** - מערכת חדשה עם bootstrap ו-ETag support
- ✅ **Debug Monitor** - מערכת ניטור ובדיקה מפורטת
- ✅ **Validation** - ולידציה מלאה של כל סוגי הנתונים
- ✅ **Cache Invalidation** - ניקוי אוטומטי בעת שמירה

### סטטיסטיקות נוכחיות:
- **126 העדפות פעילות** במערכת
- **7 קבוצות** העדפות מאורגנות
- **פרופילים מרובים** - כל משתמש יכול ליצור מספר פרופילים
- **63 צבעים** - צבעי entity, status, value, chart, UI
- **23 הגדרות התראות** - הקבוצה הגדולה ביותר

---

## 🏗️ ארכיטקטורה ומבנה

### מבנה בסיס הנתונים

```
preference_groups (קבוצות)
    ↓ (group_id)
preference_types (סוגי העדפות)
    ↓ (preference_id)
user_preferences (ערכים שמורים)
    ↓
users (via user_id)
preference_profiles (via profile_id)
```

### טבלאות:

1. **preference_groups** - קבוצות העדפות
2. **preference_types** - סוגי העדפות (126 פעילות)
3. **preference_profiles** - פרופילי משתמש
4. **user_preferences** - ערכים שמורים למשתמשים

### קבצים מרכזיים:

#### Backend:
- `Backend/models/preferences.py` - מודלי SQLAlchemy
- `Backend/services/preferences_service.py` - שירות מרכזי
- `Backend/routes/api/preferences.py` - API endpoints
- `Backend/routes/api/preferences_v4.py` - V4 API endpoints

#### Frontend:
- `trading-ui/scripts/services/preferences-data.js` - שירות API מרכזי
- `trading-ui/scripts/services/preferences-v4.js` - V4 SDK
- `trading-ui/scripts/preferences-core-new.js` - מערכת ליבה (OOP)
- `trading-ui/scripts/preferences-ui.js` - ממשק משתמש V3
- `trading-ui/scripts/preferences-ui-v4.js` - ממשק משתמש V4
- `trading-ui/scripts/preferences-page.js` - פונקציות ספציפיות לעמוד
- `trading-ui/scripts/preferences-debug-monitor.js` - מערכת ניטור ובדיקה
- `trading-ui/scripts/preferences-colors.js` - ניהול צבעים
- `trading-ui/scripts/preferences-profiles.js` - ניהול פרופילים
- `trading-ui/scripts/preferences-validation.js` - ולידציה
- `trading-ui/scripts/preferences-group-manager.js` - ניהול קבוצות
- `trading-ui/scripts/preferences-lazy-loader.js` - טעינה עצלה

---

## 🔌 ממשקים ותרחישי שימוש

### 1. קריאת העדפה בודדת

#### Backend (Python):
```python
from services.preferences_service import PreferencesService

service = PreferencesService()
preference = service.get_preference(
    user_id=1,
    preference_name="primaryCurrency"
)
# Returns: "USD" or default_value
```

#### Frontend - V3 (Legacy):
```javascript
// דרך PreferencesCore
const currency = await window.PreferencesCore.getPreference(
    'primaryCurrency',
    userId,
    profileId
);

// דרך PreferencesData
const { value } = await window.PreferencesData.loadPreference({
    preferenceName: 'primaryCurrency',
    userId: 1,
    profileId: 2
});

// דרך פונקציה גלובלית (legacy)
const currency = await window.getPreference('primaryCurrency');
```

#### Frontend - V4 (מומלץ):
```javascript
// דרך PreferencesV4 SDK
await window.PreferencesV4.bootstrap(['ui', 'trading']);
const currency = await window.PreferencesV4.getPreference('primaryCurrency');
```

### 2. קריאת קבוצת העדפות

#### Backend:
```python
group_prefs = service.get_group_preferences(
    user_id=1,
    group_name="basic_settings"
)
# Returns: {"primaryCurrency": "USD", "timezone": "Asia/Jerusalem", ...}
```

#### Frontend - V3:
```javascript
// דרך PreferencesData
const { preferences } = await window.PreferencesData.loadPreferenceGroup({
    groupName: 'basic_settings',
    userId: 1,
    profileId: 2
});

// דרך PreferencesCore
const group = await window.PreferencesCore.getGroup('basic_settings');
```

#### Frontend - V4:
```javascript
// דרך PreferencesV4 SDK
const group = await window.PreferencesV4.getGroup('basic_settings');
// Returns: { preferences: {...}, metadata: {...} }
```

### 3. קריאת כל ההעדפות

#### Backend:
```python
all_prefs = service.get_all_user_preferences(user_id=1, profile_id=2)
# Returns: {"primaryCurrency": "USD", "timezone": "Asia/Jerusalem", ...}
```

#### Frontend - V3:
```javascript
// דרך PreferencesData
const { preferences } = await window.PreferencesData.loadAllPreferencesRaw({
    userId: 1,
    profileId: 2,
    force: false
});

// דרך PreferencesCore
const all = await window.PreferencesCore.getAllPreferences(userId, profileId);
```

#### Frontend - V4:
```javascript
// דרך PreferencesV4 - Bootstrap
const { profileContext, groups } = await window.PreferencesV4.bootstrap([
    'colors', 'ui', 'trading'
]);
// groups מכיל את כל הקבוצות המבוקשות
```

### 4. שמירת העדפה בודדת

#### Backend:
```python
service.save_preference(
    user_id=1,
    preference_name="primaryCurrency",
    value="EUR",
    profile_id=2
)
```

#### Frontend - V3:
```javascript
// דרך PreferencesData
await window.PreferencesData.savePreference({
    preferenceName: 'primaryCurrency',
    value: 'EUR',
    userId: 1,
    profileId: 2
});

// דרך PreferencesCore
await window.PreferencesCore.savePreference(
    'primaryCurrency',
    'EUR',
    userId,
    profileId
);

// דרך פונקציה גלובלית (legacy)
await window.savePreference('primaryCurrency', 'EUR');
```

#### Frontend - V4:
```javascript
// דרך PreferencesV4 SDK
await window.PreferencesV4.setPreference('primaryCurrency', 'EUR');
// Cache מתעדכן אוטומטית
```

### 5. שמירת מספר העדפות

#### Backend:
```python
service.save_user_preferences(
    user_id=1,
    preferences={
        "primaryCurrency": "EUR",
        "timezone": "Europe/London"
    },
    profile_id=2
)
```

#### Frontend - V3:
```javascript
// דרך PreferencesData
await window.PreferencesData.savePreferences({
    preferences: {
        primaryCurrency: 'EUR',
        timezone: 'Europe/London'
    },
    userId: 1,
    profileId: 2
});

// דרך PreferencesCore
await window.PreferencesCore.savePreferences({
    primaryCurrency: 'EUR',
    timezone: 'Europe/London'
}, userId, profileId);
```

#### Frontend - V4:
```javascript
// דרך PreferencesV4 SDK
await window.PreferencesV4.setPreferences({
    primaryCurrency: 'EUR',
    timezone: 'Europe/London'
});
```

### 6. ניהול פרופילים

#### יצירת פרופיל חדש:
```javascript
// דרך PreferencesData
const result = await window.PreferencesData.createProfile({
    name: 'פרופיל חדש',
    description: 'תיאור הפרופיל',
    userId: 1
});

// דרך ProfileManager
await window.ProfileManager.createProfile({
    name: 'פרופיל חדש',
    description: 'תיאור הפרופיל',
    userId: 1
});
```

#### החלפת פרופיל פעיל:
```javascript
// דרך PreferencesData
await window.PreferencesData.activateProfile({
    profileId: 2,
    userId: 1
});

// דרך ProfileManager
await window.ProfileManager.switchProfile(2, 1);
// מבצע ניקוי cache מלא + reload אוטומטי
```

#### מחיקת פרופיל:
```javascript
// דרך PreferencesData
await window.PreferencesData.deleteProfile({
    profileId: 2,
    userId: 1
});

// דרך ProfileManager
await window.ProfileManager.deleteProfile(2, 1);
// מציג אישור + החלפה אוטומטית אם פעיל
```

#### טעינת פרופילים:
```javascript
// דרך PreferencesData
const { profiles, profileContext } = await window.PreferencesData.loadProfiles({
    userId: 1,
    force: true
});

// דרך ProfileManager
const profiles = await window.ProfileManager.getProfiles(1);
```

### 7. טעינת חשבונות מסחר

```javascript
// דרך SelectPopulatorService (מומלץ)
await window.SelectPopulatorService.populateAccountsSelect(
    'default_trading_account',
    {
        includeEmpty: true,
        defaultFromPreferences: true,
        defaultValue: null
    }
);

// דרך loadAccountsForPreferences
await window.loadAccountsForPreferences();
// טוען חשבונות פעילים וממלא את ה-select
```

### 8. טעינת טבלת סוגי העדפות

```javascript
// דרך renderPreferenceTypesAuditTable
await window.renderPreferenceTypesAuditTable();
// טוען את כל סוגי ההעדפות מהבסיס נתונים ומציג בטבלה
```

---

## 🌐 מדריך API

### Base URL
```
http://localhost:8080/api/preferences
```

### Authentication
כל ה-endpoints דורשים authentication דרך `@require_authentication()` decorator.

### Endpoints מרכזיים:

#### 1. Bootstrap (V4)
```
GET /api/preferences/bootstrap?profile_id={id}
```
**תגובה:**
```json
{
  "success": true,
  "data": {
    "profile_context": {
      "user_id": 1,
      "profile_id": 2,
      "user": {...},
      "resolved_profile": {...},
      "versions": {...}
    },
    "groups": {
      "colors": {...},
      "ui": {...},
      "trading": {...}
    },
    "version_hash": "..."
  }
}
```
**תכונות:**
- ETag support (304 Not Modified)
- Conditional GET
- Cache-friendly

#### 2. קבלת העדפה בודדת
```
GET /api/preferences/user/single?preference_name={name}&user_id={id}&profile_id={id}
```

#### 3. קבלת קבוצת העדפות
```
GET /api/preferences/user/group?group={name}&user_id={id}&profile_id={id}
```

#### 4. קבלת כל ההעדפות
```
GET /api/preferences/user?user_id={id}&profile_id={id}
```

#### 5. שמירת העדפה בודדת
```
POST /api/preferences/user/single
Body: {
  "preference_name": "primaryCurrency",
  "value": "EUR",
  "user_id": 1,
  "profile_id": 2
}
```

#### 6. שמירת מספר העדפות
```
POST /api/preferences/user/save
Body: {
  "preferences": {
    "primaryCurrency": "EUR",
    "timezone": "Europe/London"
  },
  "user_id": 1,
  "profile_id": 2
}
```

#### 7. ניהול פרופילים
```
GET /api/preferences/profiles?user_id={id}
POST /api/preferences/profiles
POST /api/preferences/profiles/activate
DELETE /api/preferences/profiles/{profile_id}?user_id={id}
```

#### 8. Admin Endpoints
```
GET /api/preferences/admin/types
GET /api/preferences/admin/groups
POST /api/preferences/admin/search
```

---

## 💻 מדריך Frontend

### אתחול מערכת

#### V4 (מומלץ):
```javascript
// בעמוד preferences.html
if (window.PreferencesUIV4 && typeof window.PreferencesUIV4.initialize === 'function') {
    await window.PreferencesUIV4.initialize();
}
```

#### V3 (Legacy):
```javascript
// בעמוד preferences.html
if (window.PreferencesUI && typeof window.PreferencesUI.initialize === 'function') {
    await window.PreferencesUI.initialize();
}
```

### שימוש ב-PreferencesV4 SDK

```javascript
// 1. Bootstrap - טעינת profile context וקבוצות בסיסיות
const { profileContext, groups } = await window.PreferencesV4.bootstrap([
    'colors', 'ui', 'trading'
]);

// 2. קבלת קבוצה
const uiGroup = await window.PreferencesV4.getGroup('ui');
// Returns: { preferences: {...}, metadata: {...} }

// 3. קבלת העדפה בודדת
const currency = await window.PreferencesV4.getPreference('primaryCurrency');

// 4. שמירת העדפה
await window.PreferencesV4.setPreference('primaryCurrency', 'EUR');

// 5. שמירת מספר העדפות
await window.PreferencesV4.setPreferences({
    primaryCurrency: 'EUR',
    timezone: 'Europe/London'
});

// 6. האזנה לעדכונים
window.addEventListener('preferences:updated', (e) => {
    const { scope, preferenceName, value } = e.detail;
    // scope: 'single' | 'group' | 'all'
    // עדכן UI בהתאם
});
```

### שימוש ב-PreferencesData Service

```javascript
// 1. טעינת העדפה בודדת
const { value } = await window.PreferencesData.loadPreference({
    preferenceName: 'primaryCurrency',
    userId: 1,
    profileId: 2,
    force: false
});

// 2. טעינת קבוצה
const { preferences } = await window.PreferencesData.loadPreferenceGroup({
    groupName: 'basic_settings',
    userId: 1,
    profileId: 2,
    force: false
});

// 3. טעינת כל ההעדפות
const { preferences } = await window.PreferencesData.loadAllPreferencesRaw({
    userId: 1,
    profileId: 2,
    force: false
});

// 4. שמירת העדפה
await window.PreferencesData.savePreference({
    preferenceName: 'primaryCurrency',
    value: 'EUR',
    userId: 1,
    profileId: 2
});

// 5. שמירת מספר העדפות
await window.PreferencesData.savePreferences({
    preferences: {
        primaryCurrency: 'EUR',
        timezone: 'Europe/London'
    },
    userId: 1,
    profileId: 2
});

// 6. ניהול פרופילים
const { profiles, profileContext } = await window.PreferencesData.loadProfiles({
    userId: 1,
    force: true
});

await window.PreferencesData.createProfile({
    name: 'פרופיל חדש',
    description: 'תיאור',
    userId: 1
});

await window.PreferencesData.activateProfile({
    profileId: 2,
    userId: 1
});

await window.PreferencesData.deleteProfile({
    profileId: 2,
    userId: 1
});
```

### שימוש ב-PreferencesCore

```javascript
// 1. קביעת פרופיל פעיל
window.PreferencesCore.setCurrentProfile(userId, profileId);

// 2. קבלת העדפה
const value = await window.PreferencesCore.getPreference(
    'primaryCurrency',
    userId,
    profileId
);

// 3. קבלת קבוצה
const group = await window.PreferencesCore.getGroup(
    'basic_settings',
    userId,
    profileId
);

// 4. קבלת כל ההעדפות
const all = await window.PreferencesCore.getAllPreferences(userId, profileId);

// 5. שמירת העדפה
await window.PreferencesCore.savePreference(
    'primaryCurrency',
    'EUR',
    userId,
    profileId
);

// 6. שמירת מספר העדפות
await window.PreferencesCore.savePreferences({
    primaryCurrency: 'EUR',
    timezone: 'Europe/London'
}, userId, profileId);
```

---

## 👤 ניהול פרופילים

### יצירת פרופיל חדש

```javascript
// דרך ProfileManager
const profileId = await window.ProfileManager.createProfile({
    name: 'פרופיל מסחר',
    description: 'פרופיל למסחר יומי',
    userId: 1
});

// דרך PreferencesData
const result = await window.PreferencesData.createProfile({
    name: 'פרופיל מסחר',
    description: 'פרופיל למסחר יומי',
    userId: 1
});
// Returns: { success: true, data: { profile_id: 2, ... } }
```

**התנהגות:**
- פרופיל חדש נוצר עם `is_active=0` (לא פעיל)
- לא נוצרות רשומות העדפות אוטומטית
- העדפות נטענות מ-`default_value` כשאין ערך שמור
- הדף מתרענן אוטומטית להצגת הפרופיל החדש

### החלפת פרופיל פעיל

```javascript
// דרך ProfileManager
await window.ProfileManager.switchProfile(profileId, userId);
// מבצע:
// 1. ניקוי cache מלא (Full - 100%)
// 2. עדכון PreferencesCore
// 3. Reload אוטומטי של הדף

// דרך PreferencesData
await window.PreferencesData.activateProfile({
    profileId: 2,
    userId: 1
});
```

### מחיקת פרופיל

```javascript
// דרך ProfileManager
await window.ProfileManager.deleteProfile(profileId, userId);
// מבצע:
// 1. בדיקה שאין זה הפרופיל האחרון
// 2. מציג אישור דרך מערכת ההודעות
// 3. אם פעיל - מחליף אוטומטית לברירת מחדל
// 4. מוחק את כל ההעדפות של הפרופיל
// 5. מוחק את הפרופיל

// דרך PreferencesData
await window.PreferencesData.deleteProfile({
    profileId: 2,
    userId: 1
});
```

### טעינת פרופילים

```javascript
// דרך PreferencesData
const { profiles, profileContext } = await window.PreferencesData.loadProfiles({
    userId: 1,
    force: true
});

// דרך ProfileManager
const profiles = await window.ProfileManager.getProfiles(userId);

// דרך loadProfilesToDropdown
await window.loadProfilesToDropdown(userId);
// ממלא את ה-dropdown עם כל הפרופילים
```

---

## 🎨 מערכת צבעים

### טעינת צבעים

```javascript
// דרך ColorManager
const colors = await window.ColorManager.loadAllColors(userId, profileId);

// דרך PreferencesCore
const colors = await window.PreferencesCore.getGroup('colors', userId, profileId);
```

### שמירת צבעים

```javascript
// דרך ColorManager
await window.ColorManager.saveColor('primaryColor', '#26baac', userId, profileId);

// דרך PreferencesCore
await window.PreferencesCore.savePreference('primaryColor', '#26baac', userId, profileId);
```

### עדכון CSS Variables

```javascript
// דרך ColorSchemeSystem
window.colorSchemeSystem.updateCSSVariablesFromPreferences(preferences);

// אוטומטי בעת טעינת העדפות
if (window.colorSchemeSystem?.updateCSSVariablesFromPreferences) {
    window.colorSchemeSystem.updateCSSVariablesFromPreferences(preferences);
}
```

### צבעים מיוחדים:

- **צבעי Entity**: `entityTradeColor`, `entityAccountColor`, etc.
- **צבעי Status**: `statusOpenColor`, `statusClosedColor`, etc.
- **צבעי Value**: `valuePositiveColor`, `valueNegativeColor`, etc.
- **צבעי Chart**: `chartPrimaryColor`, `chartBackgroundColor`, etc.
- **צבעי UI**: `primaryColor`, `secondaryColor`, etc.

---

## 💾 Cache ומטמון

### מבנה המטמון

מערכת ההעדפות משתמשת ב-UnifiedCacheManager עם 4 שכבות:

1. **Memory** - מטמון זיכרון (מהיר ביותר)
2. **localStorage** - מטמון דפדפן (עמיד)
3. **IndexedDB** - מטמון מתקדם (גדול)
4. **Backend** - מקור האמת

### TTL (Time To Live)

```javascript
const DEFAULT_TTL = {
    all: 2 * 60 * 1000,        // 2 דקות
    single: 60 * 1000,          // 1 דקה
    group: 2 * 60 * 1000,       // 2 דקות
    multiple: 2 * 60 * 1000,    // 2 דקות
    profiles: 2 * 60 * 1000,    // 2 דקות
    groups: 5 * 60 * 1000,      // 5 דקות
    types: 15 * 60 * 1000,      // 15 דקות
    defaults: 10 * 60 * 1000,   // 10 דקות
};
```

### ניקוי Cache

```javascript
// ניקוי העדפה בודדת
await window.PreferencesData.clearPattern('preference-single');

// ניקוי כל ההעדפות
await window.PreferencesData.clearPattern('preference-data');

// ניקוי פרופילים
await window.PreferencesData.clearPattern('profile-data');

// ניקוי מלא (Full Clear)
await window.clearAllUnifiedCacheQuick();
```

### Cache Invalidation

Cache מתנקה אוטומטית בעת:
- שמירת העדפה
- החלפת פרופיל
- מחיקת פרופיל
- עדכון העדפות

---

## 🔍 Debugging וניטור

### PreferencesDebugMonitor

מערכת ניטור אוטומטית לזיהוי בעיות:

```javascript
// התחלת ניטור אוטומטי
window.startPreferencesDebugMonitoring();
// בודק כל 2 שניות, עוצר אחרי 20 שניות

// בדיקה חד-פעמית
window.runPreferencesDebugCheck();

// יצירת דוח מפורט
const report = await window.generatePreferencesDebugReport();

// עצירת ניטור
window.stopPreferencesDebugMonitoring();
```

### מה הניטור בודק:

1. **חשבונות מסחר:**
   - האם האלמנט קיים?
   - כמה אופציות יש?
   - האם SelectPopulatorService זמין?
   - מה מחזיר ה-API?

2. **טבלת סוגי העדפות:**
   - האם האלמנטים קיימים?
   - מה התוכן הנוכחי?
   - האם PreferencesData זמין?
   - מה מחזיר ה-API?
   - מה מבנה הנתונים?

### לוגים מפורטים

כל הפונקציות כוללות לוגים מפורטים עם תגיות:
- `[Accounts]` - לוגים הקשורים לחשבונות
- `[Types Table]` - לוגים הקשורים לטבלת סוגי העדפות
- `[Profiles]` - לוגים הקשורים לפרופילים

---

## ✅ Best Practices

### 1. שימוש בממשקים

**✅ מומלץ:**
- השתמש ב-`PreferencesV4` SDK לפרויקטים חדשים
- השתמש ב-`PreferencesData` ל-API calls
- השתמש ב-`SelectPopulatorService` לטעינת חשבונות

**❌ לא מומלץ:**
- אל תשתמש ב-`fetch()` ישירות
- אל תעקוף את מערכת המטמון
- אל תשתמש ב-functions legacy אם יש חלופה V4

### 2. ניהול Cache

**✅ מומלץ:**
- השתמש ב-`force: false` לטעינה רגילה (מנצל cache)
- השתמש ב-`force: true` רק כשצריך נתונים עדכניים
- נקה cache רק כשצריך

**❌ לא מומלץ:**
- אל תעשה `force: true` בכל קריאה
- אל תנקה cache ללא סיבה
- אל תעקוף את TTL

### 3. Error Handling

**✅ מומלץ:**
```javascript
try {
    const value = await window.PreferencesV4.getPreference('primaryCurrency');
} catch (error) {
    window.Logger?.error('Failed to load preference', error);
    // Fallback to default
    const value = 'USD';
}
```

**❌ לא מומלץ:**
```javascript
// אל תזניח error handling
const value = await window.PreferencesV4.getPreference('primaryCurrency');
// מה אם זה נכשל?
```

### 4. פרופילים

**✅ מומלץ:**
- צור פרופילים עם שמות ברורים
- השתמש בפרופילים שונים למצבים שונים
- נקה cache בעת החלפת פרופיל

**❌ לא מומלץ:**
- אל תמחק פרופילים ללא אישור
- אל תעקוף את מערכת האישורים
- אל תשתמש ב-hardcoded profile IDs

---

## 🐛 Troubleshooting

### בעיה: העדפות לא נטענות

**בדיקות:**
1. בדוק console ללוגים עם תגיות `[Accounts]` או `[Types Table]`
2. בדוק שה-API מחזיר נתונים:
   ```bash
   curl "http://localhost:8080/api/preferences/user?user_id=1"
   ```
3. בדוק שה-cache לא תקוע:
   ```javascript
   await window.clearAllUnifiedCacheQuick();
   ```
4. השתמש ב-Debug Monitor:
   ```javascript
   window.runPreferencesDebugCheck();
   ```

### בעיה: חשבונות לא נטענים

**בדיקות:**
1. בדוק שה-`default_trading_account` select קיים ב-HTML
2. בדוק ש-`SelectPopulatorService` נטען:
   ```javascript
   console.log(window.SelectPopulatorService);
   ```
3. בדוק שה-API מחזיר חשבונות:
   ```bash
   curl "http://localhost:8080/api/trading-accounts/open"
   ```
4. השתמש ב-Debug Monitor:
   ```javascript
   window.startPreferencesDebugMonitoring();
   ```

### בעיה: טבלת סוגי העדפות לא מציגה נתונים

**בדיקות:**
1. בדוק שה-`preferenceTypesAuditContainer` ו-`preferenceTypesAuditTableBody` קיימים ב-HTML
2. בדוק שה-API מחזיר נתונים:
   ```bash
   curl "http://localhost:8080/api/preferences/admin/types"
   ```
3. בדוק authentication:
   ```bash
   curl -H "Authorization: Bearer ..." "http://localhost:8080/api/preferences/admin/types"
   ```
4. השתמש ב-Debug Monitor:
   ```javascript
   window.runPreferencesDebugCheck();
   ```

### בעיה: פרופילים לא נטענים

**בדיקות:**
1. בדוק שה-`profileSelect` קיים ב-HTML
2. בדוק ש-`loadProfilesToDropdown` נקראת:
   ```javascript
   await window.loadProfilesToDropdown(userId);
   ```
3. בדוק שה-API מחזיר פרופילים:
   ```bash
   curl "http://localhost:8080/api/preferences/profiles?user_id=1"
   ```
4. בדוק שה-userId נכון:
   ```javascript
   const userId = window.PreferencesUI?.currentUserId ?? 1;
   console.log('Current userId:', userId);
   ```

---

## 📚 קבצים נוספים

- [PREFERENCES_SYSTEM.md](PREFERENCES_SYSTEM.md) - תיעוד מערכת מלא
- [PREFERENCES_DEVELOPER_GUIDE.md](PREFERENCES_DEVELOPER_GUIDE.md) - מדריך הוספה/עדכון/מחיקה
- [PREFERENCES_CACHE_INTEGRATION.md](PREFERENCES_CACHE_INTEGRATION.md) - אינטגרציה עם Cache
- [IMPLEMENTING_PREFERENCES.md](IMPLEMENTING_PREFERENCES.md) - מדריך יישום קצר

---

**גרסה:** 4.0  
**תאריך עדכון:** 15 בנובמבר 2025  
**מחבר:** TikTrack Development Team

