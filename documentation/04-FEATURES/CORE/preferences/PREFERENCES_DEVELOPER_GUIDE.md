# Preferences Developer Guide - TikTrack
## מדריך למפתחים - ניהול סוגי העדפות

**תאריך:** 12 ינואר 2025  
**גרסה:** 1.0  
**מטרה:** מדריך מפורט להוספה, עדכון ומחיקה של preference types

---

## 📋 תוכן עניינים

1. [מבנה מערכת ההעדפות](#מבנה-מערכת-ההעדפות)
2. [הוספת preference type חדש](#הוספת-preference-type-חדש)
3. [עדכון preference type קיים](#עדכון-preference-type-קיים)
4. [מחיקת preference type](#מחיקת-preference-type)
5. [הוספת קבוצה חדשה](#הוספת-קבוצה-חדשה)
6. [סוגי נתונים נתמכים](#סוגי-נתונים-נתמכים)
7. [אינטגרציה עם UnifiedCacheManager](#אינטגרציה-עם-unifiedcachemanager)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## 🏗️ מבנה מערכת ההעדפות

### טבלאות Database

```
preference_groups
    ↓ (group_id)
preference_types
    ↓ (preference_id)
user_preferences
    ↓
users (via user_id)
preference_profiles (via profile_id)
```

### טבלאות קיימות

1. **preference_groups** - 13 קבוצות
2. **preference_types** - 110 העדפות פעילות
3. **user_preferences** - ערכים שמורים למשתמשים
4. **preference_profiles** - 2 פרופילים (ברירת מחדל + נימרוד)

---

## ➕ הוספת Preference Type חדש

### Step 1: הוספה לבסיס הנתונים

```sql
-- 1.1 בדוק אם הקבוצה קיימת
SELECT id, group_name FROM preference_groups;

-- 1.2 אם צריך קבוצה חדשה - דלג לסעיף "הוספת קבוצה חדשה"
-- אחרת, קבל את group_id של הקבוצה הרלוונטית:
SELECT id FROM preference_groups WHERE group_name = 'ui_settings';
-- דוגמה: id = 7

-- 1.3 הוסף את ההעדפה החדשה
INSERT INTO preference_types (
    group_id,           -- ID של הקבוצה
    preference_name,    -- שם ההעדפה (ייחודי!)
    data_type,          -- סוג הנתון (ראה "סוגי נתונים נתמכים")
    description,        -- תיאור ההעדפה
    default_value,      -- ערך ברירת מחדל
    constraints,        -- אילוצים (JSON, אופציונלי)
    is_required,        -- האם חובה? (0=לא, 1=כן)
    is_active           -- האם פעיל? (1=כן, 0=לא)
) VALUES (
    7,                  -- ui_settings
    'newFeatureName',   -- שם ייחודי באנגלית
    'boolean',          -- true/false
    'תיאור התכונה החדשה',
    'true',             -- ברירת מחדל: מופעל
    NULL,               -- אין אילוצים מיוחדים
    0,                  -- לא חובה
    1                   -- פעיל
);
```

### Step 2: הוספה ל-HTML (preferences.html)

**מיקום:** בתוך הסקשן המתאים (section2, section3, etc.)

```html
<!-- דוגמה: הוספת checkbox ל-UI Settings -->
<div class="mb-3">
    <label class="form-label">תכונה חדשה:</label>
    <div class="form-check">
        <input class="form-check-input" type="checkbox" id="newFeatureName" checked>
        <label class="form-check-label" for="newFeatureName">
            הפעל תכונה חדשה
        </label>
    </div>
</div>
```

**חשוב:**
- ה-`id` חייב להיות **זהה** ל-`preference_name` בDB
- ה-`type` חייב להתאים ל-`data_type` בDB

#### סוגי Input לפי Data Type

| data_type | HTML input | דוגמה |
|-----------|------------|-------|
| `boolean` | `checkbox` | `<input type="checkbox" id="featureName">` |
| `string` | `text` או `select` | `<input type="text" id="featureName">` |
| `integer` | `number` | `<input type="number" id="featureName">` |
| `float/number` | `number` + `step` | `<input type="number" step="0.1" id="featureName">` |
| `color` | `color` | `<input type="color" id="featureName">` |

### Step 3: בדיקה

```bash
# 1. רענן cache
curl -X POST http://localhost:8080/api/cache/clear

# 2. פתח את דף ההעדפות
open http://localhost:8080/preferences

# 3. בדוק שההעדפה:
#    - נטענת (רואים את הערך מה-DB)
#    - ניתנת לעריכה
#    - נשמרת (לחץ "שמור הכל")
#    - מתעדכנת (רענן דף - הערך נשאר)
```

### Step 4: תיעוד

עדכן את `PREFERENCES_SYSTEM.md`:

```markdown
## העדפות קיימות

### ui_settings (8) ← עדכן מספר
...
- newFeatureName - boolean - true - תיאור התכונה
```

---

## ✏️ עדכון Preference Type קיים

### שינוי ברירת מחדל

```sql
UPDATE preference_types 
SET default_value = 'new_default_value',
    updated_at = CURRENT_TIMESTAMP
WHERE preference_name = 'existingPreferenceName';
```

**דוגמה:**
```sql
-- שינוי stop loss ברירת מחדל מ-2.0 ל-3.0
UPDATE preference_types 
SET default_value = '3.0',
    updated_at = CURRENT_TIMESTAMP
WHERE preference_name = 'defaultStopLoss';
```

### שינוי תיאור

```sql
UPDATE preference_types 
SET description = 'תיאור מעודכן וברור יותר',
    updated_at = CURRENT_TIMESTAMP
WHERE preference_name = 'existingPreferenceName';
```

### שינוי סוג נתון (⚠️ זהירות!)

```sql
-- Step 1: בדוק את הערכים הקיימים
SELECT DISTINCT saved_value 
FROM user_preferences 
WHERE preference_id = (SELECT id FROM preference_types WHERE preference_name = 'featureName');

-- Step 2: וודא שכל הערכים תואמים לסוג החדש
-- אם יש ערכים לא תואמים - תקן אותם קודם!

-- Step 3: עדכן את data_type
UPDATE preference_types 
SET data_type = 'integer',  -- הסוג החדש
    updated_at = CURRENT_TIMESTAMP
WHERE preference_name = 'featureName';
```

**⚠️ אזהרה:** שינוי `data_type` יכול לגרום לשגיאות validation! וודא תאימות.

### הפיכת העדפה לחובה/אופציונלי

```sql
-- הפוך לחובה
UPDATE preference_types 
SET is_required = 1,
    updated_at = CURRENT_TIMESTAMP
WHERE preference_name = 'criticalPreference';

-- הפוך לאופציונלי
UPDATE preference_types 
SET is_required = 0,
    updated_at = CURRENT_TIMESTAMP
WHERE preference_name = 'optionalPreference';
```

---

## 🗑️ מחיקת Preference Type

### Option 1: Soft Delete (מומלץ ✅)

```sql
-- סימון כלא פעיל (לא מוחקים מה-DB)
UPDATE preference_types 
SET is_active = 0,
    updated_at = CURRENT_TIMESTAMP
WHERE preference_name = 'oldPreferenceName';
```

**יתרונות:**
- ✅ אפשר לשחזר
- ✅ History נשמר
- ✅ לא משפיע על user_preferences קיימים
- ✅ בטוח

**אחרי:**
- ההעדפה לא תיטען יותר ב-UI
- ערכים ישנים נשארים ב-DB (לא נמחקים)

### Option 2: Hard Delete (⚠️ לא מומלץ)

```sql
-- Step 1: מחק את כל הערכים השמורים למשתמשים
DELETE FROM user_preferences 
WHERE preference_id = (
    SELECT id FROM preference_types 
    WHERE preference_name = 'oldPreferenceName'
);

-- Step 2: מחק את ההעדפה עצמה
DELETE FROM preference_types 
WHERE preference_name = 'oldPreferenceName';
```

**⚠️ אזהרה:** פעולה בלתי הפיכה! כל הנתונים יימחקו לצמיתות.

**מתי להשתמש:**
- רק אם ההעדפה נוצרה בטעות
- רק אם אין נתונים שמורים
- רק לאחר אישור מפורש

---

## 📦 הוספת קבוצה חדשה

### יצירת קבוצה

```sql
-- Step 1: צור את הקבוצה
INSERT INTO preference_groups (
    group_name,
    description
) VALUES (
    'new_category',
    'תיאור הקטגוריה החדשה'
);

-- Step 2: קבל את ה-ID של הקבוצה
SELECT id, group_name FROM preference_groups WHERE group_name = 'new_category';
-- דוגמה: id = 14

-- Step 3: הוסף העדפות לקבוצה
INSERT INTO preference_types (group_id, preference_name, data_type, default_value)
VALUES (14, 'categoryPreference1', 'string', 'default');
```

### דוגמה מלאה: קבוצת "Security Settings"

```sql
-- יצירת קבוצה
INSERT INTO preference_groups (group_name, description)
VALUES ('security_settings', 'Security and privacy preferences');

-- הוספת העדפות לקבוצה
INSERT INTO preference_types (group_id, preference_name, data_type, description, default_value, is_required, is_active)
VALUES 
    ((SELECT id FROM preference_groups WHERE group_name = 'security_settings'), 
     'enableTwoFactor', 'boolean', 'Enable two-factor authentication', 'false', 0, 1),
    
    ((SELECT id FROM preference_groups WHERE group_name = 'security_settings'), 
     'sessionTimeout', 'integer', 'Session timeout in minutes', '30', 1, 1),
    
    ((SELECT id FROM preference_groups WHERE group_name = 'security_settings'), 
     'passwordExpiry', 'integer', 'Password expiry in days', '90', 1, 1);
```

### הוספה ל-HTML

```html
<!-- UI Content Section 10 Start -->
<div class="content-section" id="section10">
    <div class="section-header">
        <h2>🔒 הגדרות אבטחה</h2>
        <div class="header-actions">
            <button class="filter-toggle-btn" onclick="window.toggleSection('section10')">
                <span class="section-toggle-icon">▼</span>
            </button>
        </div>
    </div>
    <div class="section-body">
        <div class="row">
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label">אימות דו-שלבי:</label>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="enableTwoFactor">
                        <label class="form-check-label" for="enableTwoFactor">
                            הפעל אימות דו-שלבי
                        </label>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">פקיעת session (דקות):</label>
                    <input type="number" id="sessionTimeout" class="form-control" min="5" max="120">
                </div>
                <div class="mb-3">
                    <label class="form-label">תוקף סיסמה (ימים):</label>
                    <input type="number" id="passwordExpiry" class="form-control" min="30" max="365">
                </div>
            </div>
        </div>
    </div>
</div>
<!-- UI Content Section 10 End -->
```

**⚠️ חשוב:**
- ה-`id` של ה-input חייב להיות זהה ל-`preference_name`
- המערכת תיטען ותשמור אוטומטית לפי ה-`id`

---

## 📊 סוגי נתונים נתמכים

### 1. Boolean (true/false)

**DB:**
```sql
INSERT INTO preference_types (preference_name, data_type, default_value)
VALUES ('enableFeature', 'boolean', 'true');
```

**HTML:**
```html
<input class="form-check-input" type="checkbox" id="enableFeature" checked>
```

**Validation:**
- ✅ Accepts: `true`, `false`, `'true'`, `'false'`, `1`, `0`, `'yes'`, `'no'`
- ❌ Rejects: anything else

---

### 2. String (טקסט)

**DB:**
```sql
INSERT INTO preference_types (preference_name, data_type, default_value)
VALUES ('userName', 'string', 'default_name');
```

**HTML:**
```html
<!-- Option 1: Text input -->
<input type="text" id="userName" class="form-control" placeholder="הכנס שם">

<!-- Option 2: Select dropdown -->
<select id="theme" class="form-select">
    <option value="light">בהיר</option>
    <option value="dark">כהה</option>
</select>
```

**Validation:**
- ✅ Accepts: any string
- אפשר להוסיף constraints (ראה "Constraints מתקדמים")

---

### 3. Integer (מספר שלם)

**DB:**
```sql
INSERT INTO preference_types (preference_name, data_type, default_value)
VALUES ('maxItems', 'integer', '100');
```

**HTML:**
```html
<input type="number" id="maxItems" class="form-control" min="1" max="1000" step="1">
```

**Validation:**
- ✅ Accepts: `123`, `'456'`, `-789`
- ❌ Rejects: `12.34`, `'abc'`, empty

---

### 4. Float/Number (מספר עשרוני)

**DB:**
```sql
INSERT INTO preference_types (preference_name, data_type, default_value)
VALUES ('defaultStopLoss', 'number', '2.5');
-- או:
VALUES ('riskPercent', 'float', '1.75');
```

**HTML:**
```html
<input type="number" id="defaultStopLoss" class="form-control" 
       min="0" max="100" step="0.1">
```

**Validation:**
- ✅ Accepts: `12.34`, `'5.67'`, `0.001`
- ❌ Rejects: `'abc'`, empty

---

### 5. Color (צבע hex)

**DB:**
```sql
INSERT INTO preference_types (preference_name, data_type, default_value)
VALUES ('brandColor', 'color', '#007bff');
```

**HTML:**
```html
<input type="color" id="brandColor" class="form-control form-control-color" 
       data-color-key="brandColor">
```

**Validation:**
- ✅ Accepts: `#ffffff`, `#FF9800`, `#123abc`
- ❌ Rejects: `red`, `rgb(255,0,0)`, `#fff` (קצר מדי), `#gggggg`

---

### 6. JSON (אובייקט מורכב)

**DB:**
```sql
INSERT INTO preference_types (preference_name, data_type, default_value)
VALUES ('chartConfig', 'json', '{"type":"line","animation":true}');
```

**HTML:**
```html
<textarea id="chartConfig" class="form-control" rows="5"></textarea>
```

**Validation:**
- ✅ Accepts: valid JSON strings
- ❌ Rejects: invalid JSON

---

### 7. Date (תאריך)

**DB:**
```sql
INSERT INTO preference_types (preference_name, data_type, default_value)
VALUES ('startDate', 'date', '2025-01-01');
```

**HTML:**
```html
<input type="date" id="startDate" class="form-control">
```

---

### 8. Time (שעה)

**DB:**
```sql
INSERT INTO preference_types (preference_name, data_type, default_value)
VALUES ('dailyReportTime', 'time', '09:00');
```

**HTML:**
```html
<input type="time" id="dailyReportTime" class="form-control">
```

---

## 🔧 Constraints מתקדמים

### Enum (רשימה סגורה)

```sql
INSERT INTO preference_types (
    preference_name, 
    data_type, 
    default_value,
    constraints
) VALUES (
    'logLevel',
    'string',
    'info',
    '{"enum": ["debug", "info", "warn", "error"]}'
);
```

### Min/Max (טווח)

```sql
INSERT INTO preference_types (
    preference_name, 
    data_type, 
    default_value,
    constraints
) VALUES (
    'sessionTimeout',
    'integer',
    '30',
    '{"min": 5, "max": 120}'
);
```

### Pattern (Regex)

```sql
INSERT INTO preference_types (
    preference_name, 
    data_type, 
    default_value,
    constraints
) VALUES (
    'apiKey',
    'string',
    '',
    '{"pattern": "^[A-Z0-9]{32}$"}'
);
```

---

## 💡 Best Practices

### ✅ עשה (Do)

1. **שמות באנגלית** - `preference_name` תמיד באנגלית, camelCase
2. **תיאור בעברית** - `description` בעברית וברור
3. **ברירת מחדל הגיונית** - `default_value` שימושי למשתמש חדש
4. **Soft delete** - השתמש ב-`is_active = 0` במקום DELETE
5. **תיעוד** - עדכן `PREFERENCES_SYSTEM.md` אחרי כל שינוי
6. **בדיקה** - בדוק ב-UI אחרי כל שינוי
7. **Backup** - עשה backup ל-DB לפני שינויים גדולים

### ❌ אל תעשה (Don't)

1. **לא hardcode** - אל תקבע ערכים בקוד, רק ב-DB
2. **לא duplicate names** - `preference_name` חייב להיות ייחודי
3. **לא לשנות data_type בלי בדיקה** - עלול לשבור נתונים קיימים
4. **לא למחוק בhard delete** - תמיד עדיף soft delete
5. **לא לשכוח ID** - ה-`id` ב-HTML חייב להיות זהה ל-`preference_name`

---

## 🎯 דוגמאות מעשיות

### דוגמה 1: הוספת "Dark Mode" (עתידי)

```sql
-- DB
INSERT INTO preference_types (
    group_id,
    preference_name,
    data_type,
    description,
    default_value,
    is_required,
    is_active
) VALUES (
    (SELECT id FROM preference_groups WHERE group_name = 'ui_settings'),
    'darkMode',
    'boolean',
    'הפעל מצב כהה (Dark Mode)',
    'false',
    0,
    1
);
```

```html
<!-- HTML -->
<div class="mb-3">
    <label class="form-label">מצב כהה:</label>
    <div class="form-check">
        <input class="form-check-input" type="checkbox" id="darkMode">
        <label class="form-check-label" for="darkMode">
            הפעל מצב כהה
        </label>
    </div>
</div>
```

**זהו! המערכת תטפל בשאר אוטומטית.**

---

### דוגמה 2: הוספת "Max Open Trades"

```sql
-- DB
INSERT INTO preference_types (
    group_id,
    preference_name,
    data_type,
    description,
    default_value,
    constraints,
    is_required,
    is_active
) VALUES (
    (SELECT id FROM preference_groups WHERE group_name = 'trading_settings'),
    'maxOpenTrades',
    'integer',
    'מספר טריידים פתוחים מקסימלי',
    '10',
    '{"min": 1, "max": 100}',
    1,
    1
);
```

```html
<!-- HTML -->
<div class="mb-3">
    <label class="form-label">מספר טריידים פתוחים מקסימלי:</label>
    <input type="number" id="maxOpenTrades" class="form-control control-narrow" 
           min="1" max="100" value="10">
</div>
```

---

### דוגמה 3: הוספת צבע "Brand Color"

```sql
-- DB
INSERT INTO preference_types (
    group_id,
    preference_name,
    data_type,
    description,
    default_value,
    is_active
) VALUES (
    (SELECT id FROM preference_groups WHERE group_name = 'ui_colors'),
    'brandColor',
    'color',
    'צבע המותג הראשי',
    '#ff9c05',
    1
);
```

```html
<!-- HTML -->
<div class="mb-3 d-flex align-items-center gap-2">
    <label class="form-label mb-0 w-25">צבע מותג:</label>
    <input type="color" id="brandColor" class="form-control form-control-color color-picker" 
           data-color-key="brandColor">
</div>
```

---

## 🔍 Troubleshooting

### בעיה: ההעדפה לא נטענת

**סיבות אפשריות:**
1. ✅ בדוק: `preference_name` זהה ל-`id` ב-HTML?
2. ✅ בדוק: `is_active = 1` ב-DB?
3. ✅ בדוק: cache נוקה? (רענן cache)
4. ✅ בדוק: console.log - מה מגיע מה-API?

**פתרון:**
```bash
# נקה cache
curl -X POST http://localhost:8080/api/cache/clear

# בדוק API
curl "http://localhost:8080/api/preferences/user?user_id=1" | python3 -m json.tool | grep "newPreferenceName"
```

---

### בעיה: ההעדפה לא נשמרת

**סיבות אפשריות:**
1. ✅ בדוק: validation עובר? (data_type תואם?)
2. ✅ בדוק: constraints מתקיימים?
3. ✅ בדוק: console errors?

**פתרון:**
```sql
-- בדוק validation
SELECT preference_name, data_type, constraints 
FROM preference_types 
WHERE preference_name = 'problematicPref';

-- בדוק ערך שנשמר
SELECT saved_value 
FROM user_preferences 
WHERE preference_id = (SELECT id FROM preference_types WHERE preference_name = 'problematicPref');
```

---

### בעיה: שגיאת validation

**דוגמה:**
```
ValidationError: Invalid value 'abc' for preference 'maxRisk' (expected number)
```

**פתרון:**
1. בדוק שה-`data_type` ב-DB תואם לסוג הנתון
2. בדוק שה-`input type` ב-HTML תואם
3. בדוק constraints (min/max/pattern)

---

## 📚 קבוצות קיימות (13)

| # | group_name | מספר העדפות | תיאור |
|---|------------|-------------|--------|
| 1 | notification_settings | 22 | הגדרות התראות |
| 2 | entity_colors | 15 | צבעי ישויות |
| 3 | filters | 15 | צבעי פילטרים |
| 4 | value_colors | 12 | צבעי ערכים |
| 5 | trading_settings | 7 | הגדרות מסחר |
| 6 | ui_settings | 7 | הגדרות ממשק |
| 7 | chart_colors | 6 | צבעי גרפים |
| 8 | chart_settings | 6 | הגדרות גרפים |
| 9 | ui_colors | 6 | צבעי UI בסיסיים |
| 10 | filter_settings | 5 | הגדרות פילטרים |
| 11 | basic_settings | 4 | הגדרות בסיסיות |
| 12 | chart_export | 4 | יצוא גרפים |
| 13 | notifications | 1 | התראות כלליות |

---

## 🛠️ כלים שימושיים

### SQL Queries

```sql
-- רשימת כל ההעדפות הפעילות
SELECT pt.preference_name, pt.data_type, pt.default_value, pg.group_name
FROM preference_types pt
LEFT JOIN preference_groups pg ON pt.group_id = pg.id
WHERE pt.is_active = 1
ORDER BY pg.group_name, pt.preference_name;

-- ספירת העדפות לפי קבוצה
SELECT pg.group_name, COUNT(pt.id) as count
FROM preference_groups pg
LEFT JOIN preference_types pt ON pg.id = pt.group_id AND pt.is_active = 1
GROUP BY pg.group_name
ORDER BY count DESC;

-- העדפות ללא ערך ברירת מחדל
SELECT preference_name, data_type
FROM preference_types
WHERE default_value IS NULL AND is_active = 1;

-- העדפות חובה
SELECT preference_name, description
FROM preference_types
WHERE is_required = 1 AND is_active = 1;
```

### API Calls

```bash
# קבלת כל ההעדפות
curl "http://localhost:8080/api/preferences/user?user_id=1"

# קבלת העדפה בודדת
curl "http://localhost:8080/api/preferences/user/single?preference_name=primaryCurrency&user_id=1"

# שמירת העדפה
curl -X POST http://localhost:8080/api/preferences/user/single \
  -H "Content-Type: application/json" \
  -d '{"preference_name":"testPref","value":"testValue","user_id":1}'

# קבלת כל סוגי ההעדפות (admin)
curl "http://localhost:8080/api/preferences/admin/types"
```

---

## 🔄 אינטגרציה עם UnifiedCacheManager

### סקירה כללית

מערכת ההעדפות משתמשת ב-UnifiedCacheManager לניהול מטמון יעיל וסינכרון עם Backend.

### שימוש במטמון

```javascript
// קבלת העדפה עם מטמון
const preference = await window.getPreference('preferenceName');

// שמירת העדפה עם עדכון מטמון
await window.savePreference('preferenceName', 'value');

// ניקוי מטמון
await window.clearPreferencesCache();
```

### CacheSyncManager

המערכת משתמשת ב-CacheSyncManager לסינכרון אוטומטי עם Backend:

```javascript
// סינכרון אוטומטי אחרי שמירה
if (window.CacheSyncManager) {
    await window.CacheSyncManager.invalidate(['preferences', 'user_preferences']);
}
```

### יתרונות

- **ביצועים משופרים**: מטמון 4-שכבתי (Memory, localStorage, IndexedDB, Backend)
- **סינכרון אוטומטי**: עדכונים אוטומטיים בין Frontend ל-Backend
- **ניהול זיכרון**: אופטימיזציה אוטומטית של זיכרון
- **עמידות**: fallback אוטומטי במקרה של כשל

---

## 🚀 תהליך עבודה מומלץ

### הוספת preference חדש - Checklist

- [ ] **שלב 1:** תכנן את ההעדפה
  - [ ] מה השם? (באנגלית, camelCase)
  - [ ] מה הסוג? (boolean, string, integer, etc.)
  - [ ] מה ברירת המחדל?
  - [ ] לאיזו קבוצה שייכת?
  
- [ ] **שלב 2:** הוסף ל-DB
  - [ ] הרץ INSERT INTO preference_types
  - [ ] בדוק שהוספה הצליחה: SELECT * FROM preference_types WHERE preference_name = '...'
  
- [ ] **שלב 3:** הוסף ל-HTML
  - [ ] הוסף input עם id זהה
  - [ ] בחר type מתאים
  - [ ] הוסף label בעברית
  - [ ] שים בסקשן הנכון
  
- [ ] **שלב 4:** בדיקה
  - [ ] נקה cache
  - [ ] רענן דף preferences
  - [ ] בדוק שההעדפה נטענת
  - [ ] שנה ערך ושמור
  - [ ] רענן דף - בדוק שהשינוי נשמר
  
- [ ] **שלב 5:** תיעוד
  - [ ] עדכן PREFERENCES_SYSTEM.md
  - [ ] הוסף comment בקוד (אם רלוונטי)

---

## 📖 קישורים נוספים

- [PREFERENCES_SYSTEM.md](PREFERENCES_SYSTEM.md) - תיעוד מערכת ההעדפות
- [CACHE_IMPLEMENTATION_GUIDE.md](../../../02-ARCHITECTURE/FRONTEND/CACHE_IMPLEMENTATION_GUIDE.md) - מדריך cache
- [LOADING_STANDARD.md](../../../02-ARCHITECTURE/FRONTEND/LOADING_STANDARD.md) - תקן טעינה

---

**גרסה:** 1.0  
**תאריך:** 12 ינואר 2025  
**עודכן:** 12 ינואר 2025  
**מחבר:** TikTrack Development Team

