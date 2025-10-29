# ניתוח טבלאות העדפות - TikTrack

**תאריך:** 29 אוקטובר 2025  
**מטרה:** ניתוח כפילות טבלאות העדפות במסד הנתונים

---

## 📊 סיכום טבלאות

### טבלאות פעילות (עם נתונים):

| טבלה | רשומות | מטרה | סטטוס |
|------|--------|------|-------|
| `preference_groups` | 16 | קבוצות העדפות משתמש | ✅ פעיל |
| `preference_profiles` | 2 | פרופילי משתמש | ✅ פעיל |
| `preference_types` | 120 | סוגי העדפות משתמש | ✅ פעיל |
| `user_preferences` | 120 | העדפות שמורות למשתמשים | ✅ פעיל |

### טבלאות ריקות/לא פעילות:

| טבלה | רשומות | מטרה | סטטוס |
|------|--------|------|-------|
| ~~`user_preferences_v3`~~ | ~~0~~ | ~~העדפות משתמש (גרסה 3)~~ | ✅ **נמחקה** |

**תאריך מחיקה:** 29 אוקטובר 2025  
**סיבה:** טבלה ריקה ולא בשימוש - כל הנתונים נמצאים ב-`user_preferences`

### טבלאות מערכת נפרדות:

| טבלה | רשומות | מטרה | סטטוס |
|------|--------|------|-------|
| `system_setting_groups` | 1 | קבוצות הגדרות מערכת | ⚠️ לא בשימוש פעיל |
| `system_setting_types` | 12 | סוגי הגדרות מערכת | ⚠️ לא בשימוש פעיל |
| `system_settings` | 8 | הגדרות מערכת שמורות | ⚠️ לא בשימוש פעיל |

---

## 🏗️ מבנה טבלאות

### 1. `preference_groups` (16 קבוצות)
```sql
CREATE TABLE preference_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### 2. `preference_profiles` (2 פרופילים)
```sql
CREATE TABLE preference_profiles (
    user_id INTEGER NOT NULL,
    profile_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN,
    is_default BOOLEAN,
    description TEXT,
    created_by INTEGER,
    last_used_at DATETIME,
    usage_count INTEGER,
    id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY(user_id) REFERENCES users (id),
    FOREIGN KEY(created_by) REFERENCES users (id)
)
```

### 3. `preference_types` (120 העדפות)
```sql
CREATE TABLE preference_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    data_type VARCHAR(20) NOT NULL,
    preference_name VARCHAR(100) NOT NULL,
    description TEXT,
    constraints TEXT,  -- JSON עם הגבלות ואימותים
    default_value TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES preference_groups(id),
    UNIQUE(group_id, preference_name)
)
```

### 4. `user_preferences` (120 העדפות שמורות)
```sql
CREATE TABLE user_preferences (
    id INTEGER,
    user_id INTEGER NOT NULL,
    profile_id INTEGER NOT NULL,
    preference_id INTEGER NOT NULL,
    saved_value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (preference_id) REFERENCES preference_types(id),
    FOREIGN KEY (user_id, profile_id) REFERENCES preference_profiles(user_id, profile_name)
)
```

### 5. `user_preferences_v3` (0 רשומות - ריקה)
```sql
CREATE TABLE user_preferences_v3 (
    user_id INTEGER NOT NULL,
    profile_id INTEGER NOT NULL,
    preference_id INTEGER NOT NULL,
    saved_value TEXT,
    id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY(profile_id) REFERENCES preference_profiles (id),
    FOREIGN KEY(preference_id) REFERENCES preference_types (id)
)
```

### 6. `system_setting_groups` (1 קבוצה)
```sql
CREATE TABLE system_setting_groups (
    name VARCHAR(100) NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE (name)
)
```

### 7. `system_setting_types` (12 הגדרות)
```sql
CREATE TABLE system_setting_types (
    group_id INTEGER NOT NULL,
    "key" VARCHAR(150) NOT NULL,
    data_type VARCHAR(20) NOT NULL,
    description TEXT,
    default_value TEXT,
    is_active BOOLEAN,
    constraints_json TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY(group_id) REFERENCES system_setting_groups (id),
    UNIQUE ("key")
)
```

### 8. `system_settings` (8 הגדרות שמורות)
```sql
CREATE TABLE system_settings (
    type_id INTEGER NOT NULL,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY(type_id) REFERENCES system_setting_types (id)
)
```

---

## ⚠️ כפילות זוהתה

### כפילות בין `preference_types` ו-`system_setting_types`:

העדפות שמופיעות בשני הטבלאות:
- `borderColor`
- `console_logs_cache_enabled`
- `console_logs_initialization_enabled`
- `console_logs_notifications_enabled`
- `console_logs_ui_components_enabled`
- `entityInfoColor`
- `entityInfoColorDark`
- `entityInfoColorLight`
- `statusCancelledColor`
- `statusClosedColor`
- `statusOpenColor`
- `statusPendingColor`

### כפילות בין `user_preferences` ו-`user_preferences_v3`:

- ✅ **נפתרה:** `user_preferences_v3` נמחקה לחלוטין (29 אוקטובר 2025)
- ✅ **המערכת הפעילה:** `user_preferences` עם 120 רשומות

---

## 🔍 המלצות

### 1. מחיקת טבלה ריקה:
- ✅ **`user_preferences_v3`** - נמחקה בהצלחה (29 אוקטובר 2025)
  - גיבוי לפני: `simpleTrade_new.db.backup_before_delete_v3_20251029_150628`
  - גיבוי אחרי: `simpleTrade_new.db.backup_after_delete_v3_20251029_150649`
  - כל הנתונים נשארו ב-`user_preferences` (120 רשומות)

### 2. סינון כפילות:
- העדפות ב-`system_setting_types` שהוספו לאחרונה (12 העדפות) נראות ככפילות
- יש להחליט האם לשמור על מערכת `system_settings` נפרדת או לאחד הכל ל-`preference_types`

### 3. איחוד מערכות:
- אם `system_settings` לא בשימוש פעיל, ניתן למחוק את הטבלאות:
  - `system_setting_groups`
  - `system_setting_types`
  - `system_settings`

---

## 📝 הערות

1. **המערכת הפעילה:** `preference_types` + `user_preferences` (120 העדפות)
2. **מערכת חלופית:** `system_setting_types` + `system_settings` (12 הגדרות, לא בשימוש פעיל)
3. **טבלה ריקה:** `user_preferences_v3` (לא בשימוש)

---

## ✅ פעולות שבוצעו

1. תיקון קוד Python להשתמש ב-`user_preferences` במקום `user_preferences_v3`
2. בדיקת כפילות בין טבלאות
3. ניתוח מבנה כל טבלה

