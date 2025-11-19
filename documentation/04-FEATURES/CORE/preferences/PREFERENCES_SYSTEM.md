# מערכת העדפות - TikTrack Preferences System

> **גרסה 4.0** - מערכת העדפות גמישה ומתקדמת  
> **עדכון אחרון:** 27 בינואר 2025 - תיקון טעינת העדפות בכל העמודים, הסרת כפילות Bootstrap JS, הוספת טסטים מקיפים

---

## 📚 מדריכים

- **[PREFERENCES_COMPLETE_DEVELOPER_GUIDE.md](PREFERENCES_COMPLETE_DEVELOPER_GUIDE.md)** - מדריך מפתחים מלא עם כל הממשקים והתרחישים
- **[PREFERENCES_DEVELOPER_GUIDE.md](PREFERENCES_DEVELOPER_GUIDE.md)** - מדריך הוספה/עדכון/מחיקה של preference types
- **[PREFERENCES_CACHE_INTEGRATION.md](PREFERENCES_CACHE_INTEGRATION.md)** - אינטגרציה עם UnifiedCacheManager
- **[IMPLEMENTING_PREFERENCES.md](IMPLEMENTING_PREFERENCES.md)** - מדריך יישום קצר

---

## 🎯 מדריך מהיר למפתחים

### איך להשתמש במערכת בצורה אופטימלית:

1. **קריאת העדפות** - השתמש ב-`PreferencesService.get_preference()` עם cache
2. **שמירת העדפות** - השתמש ב-`PreferencesService.save_user_preferences()` 
3. **ניהול פרופילים** - השתמש ב-`PreferencesService.get_profiles()` ו-`create_profile()`
4. **אופטימיזציה** - העדפות נטענות פעם אחת ונשמרות ב-cache

### איך לעדכן את המערכת:

1. **הוספת הגדרה חדשה** - עדכן את `preference_types` table
2. **הוספת קבוצה חדשה** - עדכן את `preference_groups` table  
3. **שינוי מבנה** - עדכן את המודלים ב-`Backend/models/preferences.py`

### 🧪 בדיקות חובה למודול העדפות
- **Frontend**  
  - `tests/unit/preferences-page.test.js` – לוגיקה של שמירה ועומס UI  
  - `tests/integration/preferences-integration.test.js` – זרימת CRUD מלאה מול cache/unified systems  
  - `tests/e2e/user-pages/preferences-scripts-loading.test.js` – **חדש!** בדיקת טעינת העדפות בכל העמודים
  - `tests/e2e/user-pages/preferences.test.js` – בדיקת עמוד העדפות
  - `tests/e2e/preferences-flow.test.js` – מסלול משתמש מלא בעמוד ההעדפות
  - `tests/unit/preferences.v4.events.test.js` – בדיקת אירועי Preferences V4
  - `tests/integration/preferences.v4.bootstrap.integration.test.js` – בדיקת bootstrap flow
- **Backend**  
  - `Backend/tests/test_routes/test_indexeddb_and_preferences_routes.py` – `/api/preferences/version` ו-`/api/preferences/user/check-updates`  
  - `Backend/tests/test_services/test_tag_service.py` – וידוא אינטגרציית cache + analytics שמוזנות להעדפות
- **פקודות מומלצות:**  
  ```
  npm run test -- --coverage --runInBand
  npm run test -- tests/e2e/user-pages/preferences-scripts-loading.test.js
  python3 -m pytest Backend/tests/test_routes/test_indexeddb_and_preferences_routes.py
  ```
  יש לעדכן את `tests/TEST_STATUS_REPORT.md` בכל שינוי המשפיע על העדפות.

### סטטיסטיקות מערכת נוכחיות - **עדכון 27/01/2025:**
- **126 העדפות פעילות** במערכת (עדכון מדויק לפי DB)
- **7 קבוצות** העדפות מאורגנות
- **פרופילים מרובים** - כל משתמש יכול ליצור מספר פרופילים
- **63 צבעים** (entity, status, type, priority, value, chart colors, UI colors)
- **23 הגדרות התראות** (הקבוצה הגדולה ביותר)
- **Debug Monitor** - מערכת ניטור ובדיקה מפורטת
- **15 עמודים** עם preferences package - כולם מתוקנים ומאומתים
- **60+ טסטים** לבדיקת טעינת העדפות בכל העמודים

---

## 🗄️ מבנה בסיס הנתונים

### 1. טבלת `preference_groups` (קבוצות העדפות)
```sql
CREATE TABLE preference_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. טבלת `preference_types` (סוגי העדפות)
```sql
CREATE TABLE preference_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    data_type VARCHAR(20) NOT NULL,
    preference_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    constraints TEXT,
    default_value TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES preference_groups(id)
);
```

### 3. טבלת `preference_profiles` (פרופילי משתמש)
```sql
CREATE TABLE preference_profiles (
    user_id INTEGER NOT NULL,
    profile_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_by VARCHAR(100),
    last_used_at DATETIME,
    usage_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, profile_name)
);
```

### 4. טבלת `user_preferences` (העדפות משתמש)
```sql
CREATE TABLE user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    profile_id VARCHAR(100) NOT NULL,
    preference_id INTEGER NOT NULL,
    saved_value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (preference_id) REFERENCES preference_types(id),
    FOREIGN KEY (user_id, profile_id) REFERENCES preference_profiles(user_id, profile_name)
);
```

---

## 🔧 פונקציות נגישות

### PreferencesService - פונקציות עיקריות:

```python
# קריאת העדפה בודדת
preference = service.get_preference(user_id=1, preference_name="primaryCurrency")

# קריאת קבוצת העדפות
group_prefs = service.get_group_preferences(user_id=1, group_name="basic_settings")

# קריאת מספר העדפות
multiple_prefs = service.get_preferences_by_names(
    user_id=1, 
    preference_names=["primaryCurrency", "timezone", "language"]
)

# שמירת העדפה
service.save_preference(
    user_id=1, 
    preference_name="primaryCurrency", 
    value="USD"
)

# ניהול פרופילים
profiles = service.get_user_profiles(user_id=1)
new_id = service.create_profile(user_id=1, profile_name="Trading", description="פרופיל מסחר")
service.activate_profile(user_id=1, profile_id=new_id)
service.delete_profile(user_id=1, profile_id=old_profile_id)
```

---

## 🚀 Cache Strategy

### אופטימיזציה לקריאה:
- **Per-user cache** עם TTL ארוך (1 שעה)
- **Invalidation** אוטומטי בעת שמירה
- **Default values** מהטבלה המרכזית

### דוגמת שימוש:
```python
# Cache נטען אוטומטית
preference = service.get_preference(user_id=1, preference_name="primaryCurrency")

# שמירה מנקה cache אוטומטית
service.save_preference(user_id=1, preference_name="primaryCurrency", value="EUR")
```

---

## ✅ Validation System

### סוגי נתונים נתמכים:
- **string** - טקסט רגיל
- **integer** - מספר שלם
- **float/number** - מספר עשרוני
- **boolean** - true/false
- **json** - JSON object
- **color** - קוד צבע (#RRGGBB)
- **date** - תאריך
- **time** - שעה

### דוגמת validation:
```python
# Validation אוטומטי
service.save_preference(user_id=1, preference_name="maxRisk", value="15.5")  # ✅
service.save_preference(user_id=1, preference_name="maxRisk", value="abc")   # ❌ Error
```

---

## 🌐 API Endpoints

### User Preferences:
- `GET /api/preferences/user` - כל ההעדפות של משתמש
- `GET /api/preferences/user/preference?name=primaryCurrency` - העדפה בודדת
- `GET /api/preferences/user/group?group=basic_settings` - קבוצת העדפות
- `POST /api/preferences/user/save` - שמירת העדפות

### Profile Management:
- `GET /api/preferences/profiles?user_id={id}` - רשימת פרופילים
- `POST /api/preferences/profiles` - יצירת פרופיל חדש
  - Body: `{user_id, profile_name, description?, created_by?, is_default?}`
  - Returns: `{success, data: {profile_id, ...}}`
  - הפרופיל נוצר עם `is_active=0` (לא פעיל) עד שהמשתמש מפעיל אותו
  - לא נוצרות רשומות העדפות אוטומטית - העדפות נטענות מ-`default_value` כשאין ערך שמור
- `POST /api/preferences/profiles/activate` - הפעלת פרופיל
- `DELETE /api/preferences/profiles/{profile_id}?user_id={id}` - מחיקת פרופיל (החלפה אוטומטית אם פעיל)

### Admin Interface:
- `GET /api/preferences/admin/types` - כל סוגי ההעדפות
- `GET /api/preferences/admin/groups` - כל הקבוצות
- `GET /api/preferences/admin/search` - חיפוש מתקדם

---

## 💻 Frontend JavaScript

### פונקציות גלובליות:
```javascript
// קריאת העדפות
const currency = await window.getPreference('primaryCurrency');
const basicSettings = await window.getGroupPreferences('basic_settings');

// שמירת העדפות
await window.savePreference('primaryCurrency', 'USD');
await window.saveAllPreferences(); // שמירת כל הטופס

// פונקציות ספציפיות לעמוד
await window.loadColorsForPreferences(); // טעינת צבעים
const formData = window.collectFormData(); // איסוף נתוני טופס

// ניהול פרופילים
const profiles = await window.getUserProfiles();
await window.createNewProfile(); // יצירת פרופיל חדש (מקריא מהשדה newProfileName)
await window.deleteCurrentProfile(); // מחיקת פרופיל פעיל (עם אישור והחלפה אוטומטית)
await window.switchToSelectedProfile(); // החלפת פרופיל (מקריא מה-dropdown)
await window.resetToDefaults(); // איפוס לברירות מחדל
```

---

## 👤 ניהול פרופילים

### תכונות מערכת הפרופילים:

**יצירת פרופיל חדש:**
- פרופיל חדש נוצר עם `is_active=0` (לא פעיל) עד שהמשתמש מפעיל אותו
- **לא נוצרות רשומות העדפות אוטומטית** - חוסך מקום בבסיס הנתונים
- העדפות נטענות מ-`preference_types.default_value` כשאין ערך שמור לפרופיל
- תהליך שמירה עובד גם כשאין עדיין העדפות לפרופיל - יוצר רשומה חדשה (`INSERT`) או מעדכן (`UPDATE`)
- לא מעתיק מהפרופיל הפעיל - התחלה נקייה עם ברירות מחדל
- הדף מתרענן אוטומטית להצגת הפרופיל החדש

**מחיקת פרופיל:**
- לא ניתן למחוק את הפרופיל האחרון במערכת
- אם מוחקים פרופיל פעיל - מחליף אוטומטית לפרופיל ברירת מחדל
- מוחק את כל ההעדפות של הפרופיל (user_preferences)
- מציג אישור דרך מערכת ההודעות (לא alert!)

**החלפת פרופיל:**
- מבצעת ניקוי cache מלא (Full - 100%)
- מבצעת reload אוטומטי של הדף
- מעדכנת את הצבעים והערכים מיד

**החלפה לברירת מחדל:**
- מאפס את כל ההעדפות בפרופיל הנוכחי לערכי ברירת המחדל
- לא יוצר פרופיל חדש - עובד על הפרופיל הקיים
- מבצע ניקוי cache ו-reload

### התכוננות למערכת משתמשים עתידית:

המערכת מוכנה למעבר למשתמשים מרובים:
- כל הפונקציות כבר מקבלות `user_id` כפרמטר (כרגע קבוע ל-1)
- מבנה הטבלאות תומך ב-`user_id` כחלק מה-primary key
- אין קוד תלוי ב-"משתמש יחיד" - הכל generic
- כאשר תתווסף מערכת אימות - פשוט להעביר את ה-`user_id` האמיתי

---

## 🎨 מערכת צבעים

### צבעי מערכת בסיסיים:
- `primaryColor` - צבע ראשי (#26baac)
- `secondaryColor` - צבע משני (#6c757d)
- `successColor` - צבע הצלחה (#28a745)
- `warningColor` - צבע אזהרה (#ffc107)
- `dangerColor` - צבע סכנה (#dc3545)

### צבעי ישויות:
- `entityAccountColor` - צבע חשבונות (#28a745)
- `entityTickerColor` - צבע מטבעות (#17a2b8)
- `entityTradeColor` - צבע עסקאות (#26baac)
- `entityCashFlowColor` - צבע תזרים מזומנים (#20c997)
- `entityCashFlowColorLight` - צבע בהיר לתזרים (#20c997)
- `entityCashFlowColorDark` - צבע כהה לתזרים (#138496)

### צבעי ערכים מספריים - **עדכון 11/2025: מחוברים ישירות ל־UI**
- `valuePositiveColor` - ערכים חיוביים (Medium) – מזין את `--numeric-positive-medium` ואת `--color-success`.
- `valuePositiveColorLight` / `valuePositiveColorDark` *(אופציונלי)* – אם מוגדרים ישמשו כרקע וערך כהה; אחרת המחלקה מחשבת גוונים אוטומטיים.
- `valueNegativeColor` + Light/Dark – מקביל ל-`--numeric-negative-*` ומזין את `--color-danger`.
- `valueNeutralColor` + Light/Dark – למצב ניטרלי (טבלאות/מצבים ללא שינוי).

### צבעי סמנטיקה נגזרת (Success / Danger / Warning / Info)
- `--color-success*` ← נגזר מצבעי valuePositive / successColor (כולל רקע/מסגרת).
- `--color-danger*` ← נגזר מצבעי valueNegative / dangerColor.
- `--color-warning*` ← נגזר מ־`warningColor` (או מחושב על בסיס הצבע הראשי בעתיד).
- `--color-info*` ← נגזר מ־`infoColor` (fallback ל־`primaryColor`).
- כל ההגדרות זמינות ב־CSS (`var(--color-success)`, `var(--color-warning-bg)` וכו׳) ומוזנות גם לרכיבי JS באמצעות `SMUIColorUtils`.

### 🆕 צבעי סטטוסים - **חדש 11/01/2025:**
- `statusOpenColor` - צבע סטטוס פתוח (#28a745) 🟢
- `statusClosedColor` - צבע סטטוס סגור (#6c757d) ⚪
- `statusCancelledColor` - צבע סטטוס מבוטל (#dc3545) 🔴

### 🆕 צבעי סוגי השקעה - **חדש 11/01/2025:**
- `typeSwingColor` - צבע swing (#17a2b8) 🔵
- `typeInvestmentColor` - צבע investment (#28a745) 🟢
- `typePassiveColor` - צבע passive (#6c757d) ⚪

### 🆕 צבעי עדיפויות - **חדש 11/01/2025:**
- `priorityHighColor` - עדיפות גבוהה (#dc3545) 🔴
- `priorityMediumColor` - עדיפות בינונית (#ffc107) 🟡
- `priorityLowColor` - עדיפות נמוכה (#28a745) 🟢

**עיקרון חשוב:** צבע אחד לכל item + `color-mix()` ב-CSS ליצירת רקע/מסגרת אוטומטי!

---

## 🔧 ממשק ניהול

### Admin Interface Features:
- **טבלה מרכזית** - כל סוגי ההעדפות
- **חיפוש מתקדם** - לפי משתמש, פרופיל, קבוצה
- **עריכת הגדרות** - הוספה/עריכה/מחיקה
- **ניהול פרופילים** - יצירה/עריכה/מחיקה

### דוגמת שימוש:
```javascript
// טעינת ממשק ניהול
window.createPreferencesAdminInterface();

// חיפוש העדפות
window.searchPreferences({
    user_id: 1,
    profile_name: "default",
    group_name: "basic_settings"
});
```

---

## ⚠️ Error Handling

### שגיאות נפוצות:
```python
# העדפה לא קיימת
PreferenceNotFoundError: "Preference 'invalidName' not found"

# משתמש לא קיים
UserNotFoundError: "User with ID 999 not found"

# פרופיל לא קיים
ProfileNotFoundError: "Profile 'invalidProfile' not found for user 1"

# Validation שגיאה
ValidationError: "Invalid value 'abc' for preference 'maxRisk' (expected number)"
```

---

## 📝 דוגמאות שימוש

### 1. טעינת העדפות לעמוד:
```javascript
document.addEventListener('DOMContentLoaded', async function() {
    // טעינת העדפות בסיסיות
    const currency = await window.getPreference('primaryCurrency');
    const timezone = await window.getPreference('timezone');
    
    // עדכון UI
    document.getElementById('primaryCurrency').value = currency || 'USD';
    document.getElementById('timezone').value = timezone || 'Asia/Jerusalem';
});
```

### 2. שמירת העדפות:
```javascript
async function savePreferences() {
    const formData = {
        primaryCurrency: document.getElementById('primaryCurrency').value,
        timezone: document.getElementById('timezone').value,
        language: document.getElementById('language').value
    };
    
    await window.savePreferences(formData);
    window.showSuccessNotification('העדפות נשמרו בהצלחה');
}
```

### 3. ניהול פרופילים:
```javascript
// קבלת רשימת פרופילים
const profiles = await window.getUserProfiles();

// יצירת פרופיל חדש (קוראת מהשדה newProfileName)
// הפרופיל נוצר עם ברירות מחדל של המערכת
await window.createNewProfile();

// החלפת פרופיל (קוראת מה-dropdown profileSwitchSelect)
// מבצעת החלפה + ניקוי cache מלא + reload אוטומטי
await window.switchToSelectedProfile();

// מחיקת פרופיל פעיל
// מציגה אישור, מחליפה לברירת מחדל, ומוחקת
await window.deleteCurrentProfile();

// איפוס לברירות מחדל
// מאפס את הפרופיל הפעיל לערכי ברירת המחדל של המערכת
await window.resetToDefaults();
```

---

## 🔄 Migration Guide

### העברת נתונים קיימים:
1. **הרץ את המיגרציה**: `python Backend/migrations/migrate_preferences.py`
2. **בדוק את הנתונים**: `python Backend/test_preferences_service.py`
3. **בדוק את ה-API**: `python Backend/test_preferences_api.py`

### נתונים שיועברו:
- כל ההעדפות הקיימות → `preference_types.default_value`
- פרופיל "Nimrod" → `preference_profiles` עם נתונים אמיתיים
- העדפות משתמש → `user_preferences` עם פרופיל ברירת מחדל

### שינויים אחרונים (ינואר 2025):
1. **הוספת 12 העדפות צבעים חסרות** - `valuePositiveColor`, `valueNegativeColor`, `valueNeutralColor` + גרסאות Light/Dark
2. **תיקון פונקציית שמירת העדפות** - `savePreferences` ב-`preferences.js`
3. **הוספת פונקציות לעמוד** - `collectFormData` ו-`saveAllPreferences` ב-`preferences-page.js`
4. **עדכון UserService** - מעבר מלא למערכת העדפות החדשה
5. **הסרת עמודים מיותרים** - `planning.html`, `currencies.html`, `database.html`

---

## 🎯 קבצים מרכזיים

### Backend:
- `Backend/models/preferences.py` - מודלי SQLAlchemy
- `Backend/services/preferences_service.py` - שירות מרכזי
- `Backend/services/user_service.py` - שירות משתמשים (משולב עם העדפות)
- `Backend/routes/api/preferences.py` - API endpoints
- `Backend/migrations/create_preferences_tables.py` - יצירת טבלאות
- `Backend/migrations/add_preferences_constraints.py` - הוספת אילוצים
- `Backend/migrations/add_missing_color_preferences.py` - הוספת צבעים חסרים

### Frontend:
- `trading-ui/scripts/services/preferences-data.js` - שירות API מרכזי
- `trading-ui/scripts/services/preferences-v4.js` - V4 SDK עם bootstrap ו-ETag
- `trading-ui/scripts/preferences-core-new.js` - מערכת ליבה (OOP)
- `trading-ui/scripts/preferences-ui.js` - ממשק משתמש V3 (Legacy)
- `trading-ui/scripts/preferences-ui-v4.js` - ממשק משתמש V4 (מומלץ)
- `trading-ui/scripts/preferences-page.js` - פונקציות ספציפיות לעמוד (loadAccountsForPreferences, renderPreferenceTypesAuditTable)
- `trading-ui/scripts/preferences-debug-monitor.js` - מערכת ניטור ובדיקה מפורטת
- `trading-ui/scripts/preferences-colors.js` - ניהול צבעים
- `trading-ui/scripts/preferences-profiles.js` - ניהול פרופילים
- `trading-ui/scripts/preferences-validation.js` - ולידציה
- `trading-ui/scripts/preferences-group-manager.js` - ניהול קבוצות
- `trading-ui/scripts/preferences-lazy-loader.js` - טעינה עצלה
- `trading-ui/preferences.html` - עמוד העדפות (ממשק HTML)

### Testing:
- `Backend/test_preferences_service.py` - בדיקות שירות
- `Backend/test_preferences_api.py` - בדיקות API
- `Backend/test_preferences_validation.py` - בדיקות validation

---

## 🚀 ביצועים

### אופטימיזציות:
- **Cache per-user** עם TTL של 1 שעה
- **Indexes** על user_id, profile_id, preference_id
- **Batch operations** לשמירה מרובה
- **Lazy loading** של פרופילים
- **4-Layer Cache System** - Memory → localStorage → IndexedDB → Backend
- **Cache Warming** - העדפות נשמרות ב-Memory layer לאחר טעינה
- **Event-Driven Architecture** - מערכות תלויות מקבלות עדכונים דרך events

### מדדי ביצועים:
- **קריאת העדפה בודדת**: < 10ms (עם cache)
- **טעינת כל ההעדפות**: < 50ms (עם cache), < 500ms (ללא cache)
- **טעינת העדפות קריטיות**: < 50ms (עם cache), < 500ms (ללא cache)
- **שמירת העדפות**: < 100ms (4 העדפות)

---

## 🔄 Lazy Loading עם Events

### Event System

המערכת משדרת 4 אירועים עיקריים:

1. **`preferences:critical-loaded`** - העדפות קריטיות נטענו
   - נשלח מיד לאחר טעינת העדפות הקריטיות
   - Detail כולל: `preferences`, `fromCache`, `cacheLayer`, `userId`, `profileId`, `loadTime`, `environment`, `criticalCount`, `totalCritical`, `timestamp`

2. **`preferences:all-loaded`** - כל ההעדפות נטענו
   - נשלח לאחר טעינת כל ההעדפות
   - Detail כולל: `preferences`, `fromCache`, `cacheLayer`, `loadTime`, `environment`

3. **`preferences:cache-hit`** - העדפות נטענו מהמטמון
   - Detail כולל: `cacheLayer`, `loadTime`, `environment`

4. **`preferences:cache-miss`** - העדפות נטענו מהשרת
   - Detail כולל: `loadTime`, `environment`

### Global Flags

- **`window.__preferencesCriticalLoaded`** - Boolean flag המציין אם העדפות הקריטיות נטענו
- **`window.__preferencesCriticalLoadedDetail`** - Object עם מידע מפורט על ההעדפות שנטענו

### שימוש במערכות תלויות

```javascript
// בדיקה אם העדפות כבר נטענו
if (window.__preferencesCriticalLoaded) {
  // העדפות כבר נטענו, אפשר להשתמש בהן מיד
  const defaultAccount = window.currentPreferences?.default_trading_account;
} else {
  // המתין לאירוע
  window.addEventListener('preferences:critical-loaded', () => {
    const defaultAccount = window.currentPreferences?.default_trading_account;
    // ... use preferences
  }, { once: true });
}
```

ראה [PREFERENCES_LOADING_BEST_PRACTICES.md](../../02-ARCHITECTURE/FRONTEND/PREFERENCES_LOADING_BEST_PRACTICES.md) למדריך מלא.

---

## 💾 Cache Integration

### 4-Layer Cache System

המערכת משתמשת ב-4 שכבות מטמון:

1. **Memory** - המהיר ביותר, נמחק עם רענון דף
2. **localStorage** - נשמר בין רענונים, מוגבל בגודל
3. **IndexedDB** - נשמר לטווח ארוך, יכול לאחסן כמויות גדולות
4. **Backend** - מקור האמת, נגיש תמיד

### Cache Warming

לאחר טעינת העדפות משכבה כלשהי, המערכת שומרת אותן גם ב-Memory layer לביצועים מהירים יותר בפעם הבאה.

### Fallback Mechanisms

אם שכבה אחת נכשלת, המערכת מנסה את השכבה הבאה:
- Memory → localStorage → IndexedDB → Backend

---

## 🌍 Environment Handling

### Development vs Production

המערכת מזהה את הסביבה ומתאימה את ההתנהגות:

- **Development:**
  - Timeout: 3 שניות
  - Logging מפורט
  - Debug mode פעיל

- **Production:**
  - Timeout: 5 שניות
  - Logging מינימלי
  - Debug mode כבוי

### זיהוי סביבה

```javascript
const environment = window.API_ENV || 'development';
const timeoutMs = environment === 'production' ? 5000 : 3000;
```

---

## 📱 מצבי טעינה

### 1. טעינה רגילה (עם מטמון)

- **מצב:** מטמון מלא (Memory + localStorage + IndexedDB)
- **צפוי:** טעינה מהירה (< 100ms), `preferences:cache-hit`, `fromCache: true`
- **Performance:** < 50ms לטעינת העדפות הקריטיות

### 2. ריענון קשיח (ללא מטמון)

- **מצב:** Ctrl+Shift+R או ניקוי מטמון מלא
- **צפוי:** טעינה מהשרת, `preferences:cache-miss`, `fromCache: false`, אין שגיאות 429
- **Performance:** < 500ms לטעינת העדפות הקריטיות

### 3. גלישה בסטר (ללא מטמון)

- **מצב:** חלון גלישה בסטר חדש
- **צפוי:** טעינה מהשרת, אין שגיאות 429, כל הטבלאות נטענות
- **Performance:** < 500ms לטעינת העדפות הקריטיות

### 4. פיתוח vs פרודקשן

- **מצב:** בדיקה בשני הסביבות
- **צפוי:** timeout שונים (3s dev, 5s prod), logging מותאם
- **Performance:** זהה בשני הסביבות, אך timeout שונים
- **Cache hit ratio**: > 95%
- **56 העדפות** שמורות למשתמש

---

## 🔒 אבטחה

### הגנות:
- **Validation** בכל השכבות
- **SQL Injection** protection
- **User isolation** - משתמשים רואים רק את הנתונים שלהם
- **Profile permissions** - גישה רק לפרופילים של המשתמש

---

## 📊 סטטיסטיקות מערכת

### נתונים:
- **4 טבלאות** במבנה גמיש
- **15+ API endpoints** מלאים
- **110 העדפות** מוגדרות מראש (עדכון 12/01/2025)
- **13 קבוצות** העדפות מאורגנות
- **Cache TTL**: 1 שעה (Frontend), 24 שעות (Backend)
- **Validation**: 8 סוגי נתונים

### הצלחה:
- ✅ **100% מיגרציה** - כל הנתונים הועברו
- ✅ **100% API coverage** - כל הפונקציות עובדות
- ✅ **100% validation** - כל סוגי הנתונים נתמכים
- ✅ **Cache optimization** - ביצועים משופרים ב-90%

---

**גרסה**: 4.0  
**תאריך עדכון**: 15 בנובמבר 2025  
**סטטוס**: ✅ Production Ready - מערכת מלאה עם V4, Profiles, Debug Monitor  
**מפתח**: TikTrack Development Team

---

## 📋 סיכום השינויים האחרונים

### ✅ מה שהושלם (31.01.2025):
1. **איחוד קבוצות העדפות** - מ-16 קבוצות ל-7 קבוצות מאוחדות
2. **הוספת כל צבעי entity** - 33 צבעי entity עם כל הוריאנטים (Light/Dark)
3. **הוספת צבעי UI** - backgroundColor, textColor, borderColor, shadowColor, highlightColor
4. **תיקון RGBA to RGB** - המרה אוטומטית של צבעים עם alpha channel
5. **איחוד כפתורי שמירה** - כפתור אחד בכותרת כל סקשן (UX אחיד)
6. **הסרת כפילויות** - הסרת saveAllColorPreferences והוספת convertToColorInputFormat
7. **עדכון סטטיסטיקות** - 123 העדפות, 7 קבוצות, 63 צבעים

### ✅ מה שהושלם (19.01.2025):
1. **ספירה מדויקת של הגדרות** - 60 בממשק, 56 בבסיס הנתונים
2. **הוספת 3 הגדרות מסחר חסרות** - `maxAccountRisk`, `maxPositionSize`, `maxTradeRisk`
3. **תיקון פונקציות JavaScript** - `loadColorsForPreferences` ו-`collectFormData` פועלות
4. **בדיקת API מקיפה** - כל ה-endpoints עובדים מושלם
5. **התאמה מושלמת** - 56 העדפות במערכת, שמירה וטעינה עובדות
6. **הוספת 12 העדפות צבעים חסרות** - `valuePositiveColor`, `valueNegativeColor`, `valueNeutralColor` + גרסאות Light/Dark
7. **תיקון פונקציית שמירת העדפות** - `savePreferences` ב-`preferences.js` עכשיו בודקת `result.success`
8. **עדכון UserService** - מעבר מלא למערכת העדפות החדשה
9. **הסרת עמודים מיותרים** - `planning.html`, `currencies.html`, `database.html`
10. **תיקון נתיבי השרת** - כל העמודים וה-APIs עובדים

### 📊 סטטיסטיקות נוכחיות:
- **56 העדפות** פעילות במערכת
- **9 קבוצות** העדפות מאורגנות
- **2 פרופילים** משתמש (ברירת מחדל + נימרוד)
- **65 העדפות** שמורות למשתמש בכל פרופיל
- **24 צבעי ישויות** עם 3 וריאנטים כל אחד
- **מטבע משני יורו** מוגדר בפרופיל נימרוד
- **שני פרופילים זהים** לחלוטין

### 🚀 מערכת מוכנה לשימוש!

---

## 🛠️ מדריכים נוספים

- **[PREFERENCES_DEVELOPER_GUIDE.md](PREFERENCES_DEVELOPER_GUIDE.md)** - מדריך למפתחים: הוספה, עדכון ומחיקה של preference types
- **[PREFERENCES_COMPLETE_AUDIT_REPORT.md](../../../../PREFERENCES_COMPLETE_AUDIT_REPORT.md)** - דו"ח ביקורת מלא v2.0 (12/01/2025)

---

**Date Created:** January 2025  
**Date Updated:** October 12, 2025 - Profile Management Implemented  
**Architecture:** ✨ **NEW** - OOP with 5 Classes (preferences-core.js)  
**Status:** ✅ Production Ready - Full CRUD for Profiles
---

## 🧹 Cache Management

מערכת ההעדפות משתמשת ב-UnifiedCacheManager לניהול מטמון:

### **מדיניות מטמון:**
- **Layer:** localStorage
- **TTL:** 300000ms (5 דקות)
- **Key Format:** `preference_{name}_{userId}_{profileId}`
- **Validation:** true
- **Sync to Backend:** false (manual save)

### **תהליכי מטמון:**
1. **טעינת העדפה:** בדיקה ב-UnifiedCacheManager → טעינה מ-backend → שמירה ב-cache
2. **שמירת העדפה:** שמירה ל-backend → מחיקת cache
3. **החלפת פרופיל:** עדכון PreferencesCore → ניקוי כל המטמון

### **ניקוי מטמון:**
- **העדפה בודדת:** `window.UnifiedCacheManager.remove(cacheKey)`
- **כל ההעדפות:** `window.clearAllUnifiedCacheQuick()`
- **לפי פרופיל:** ניקוי כל ההעדפות של פרופיל מסוים

## 📚 מדריכים נוספים

- **[Cache Integration Guide](PREFERENCES_CACHE_INTEGRATION.md)** - שילוב מלא עם UnifiedCacheManager
- **[Developer Guide](PREFERENCES_DEVELOPER_GUIDE.md)** - הוספה, עדכון, מחיקה של preference types

---

## 🎨 פלטות צבעים

### **פרופיל 1 - אלגנטיות מודרנית:**
- 54 צבעים הרמוניים
- צבעים עמוקים ומקצועיים
- מתאים לעבודה יום-יומית

### **פרופיל 2 - פסטל מעודנת:**
- 54 צבעים פסטליים
- גוונים רכים ועדינים
- "פאנץ'" רק באזהרות ודחוף

---

**עדכון אחרון:** 15 בנובמבר 2025 - תיקון טעינת חשבונות וטבלת סוגי העדפות, הוספת Debug Monitor
**גרסה:** 4.0
**שינויים:** 
- תיקון טעינת חשבונות מסחר (SelectPopulatorService)
- תיקון טבלת סוגי העדפות (renderPreferenceTypesAuditTable)
- הוספת PreferencesDebugMonitor - מערכת ניטור ובדיקה מפורטת
- הוספת לוגים מפורטים לכל הפונקציות
- עדכון PREFERENCES_COMPLETE_DEVELOPER_GUIDE.md - מדריך מפתחים מלא

