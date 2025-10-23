# מדריך הוספת העדפות חדשות
## Preferences Migration Guide

**Author:** TikTrack Development Team  
**Date:** January 23, 2025  
**Version:** 1.0.0

---

## תהליך הוספת העדפה חדשה

### שלב 1: יצירת Migration Script

1. העתק את התבנית:
```bash
cp Backend/migrations/_template_preference.py Backend/migrations/add_[your_preference].py
```

2. ערוך את הקובץ והוסף את ההעדפות החדשות

3. הרץ את המיגרציה:
```bash
cd Backend
python3 migrations/add_[your_preference].py
```

---

### שלב 2: הוספה ל-HTML

הוסף input field ב-`trading-ui/preferences.html`:

```html
<div class="mb-3">
    <label for="myNewPreference" class="form-label">שם ההעדפה</label>
    <input type="text" 
           class="form-control" 
           id="myNewPreference"
           data-preference="myNewPreference">
    <small class="form-text text-muted">תיאור ההעדפה</small>
</div>
```

**חשוב:** ה-`id` וה-`data-preference` **חייבים** להיות זהים לשם ההעדפה בבסיס הנתונים!

---

### שלב 3: בדיקת סנכרון

הרץ את הסקריפט לבדיקת סנכרון:

```bash
python3 Backend/scripts/validate_preferences_sync.py
```

אם יש העדפות חסרות, הסקריפט יזהה אותן וידווח.

---

### שלב 4: Commit

```bash
git add -A
git commit -m "Added [preference_name] preference"
```

---

## דוגמה מלאה: הוספת העדפת צבע

### 1. יצירת Migration

**קובץ:** `Backend/migrations/add_custom_color.py`

```python
#!/usr/bin/env python3
"""
Migration: Add Custom Color Preference
"""

import sqlite3
import os

def add_custom_color():
    db_path = os.path.join(os.path.dirname(__file__), "..", "db", "simpleTrade_new.db")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if preference already exists
    cursor.execute('''
        SELECT id FROM preference_types 
        WHERE preference_name = 'customBrandColor'
    ''')
    
    if cursor.fetchone():
        print("⏭️ Preference already exists")
        conn.close()
        return
    
    # Insert new preference
    cursor.execute('''
        INSERT INTO preference_types (
            group_id, data_type, preference_name,
            description, default_value, is_required, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        3,  # colors group
        'string',
        'customBrandColor',
        'צבע מותאם אישית למותג',
        '#007bff',
        False,
        True
    ))
    
    conn.commit()
    conn.close()
    
    print("✅ Added customBrandColor preference")

if __name__ == '__main__':
    add_custom_color()
```

### 2. הרצת המיגרציה

```bash
cd Backend
python3 migrations/add_custom_color.py
```

פלט צפוי:
```
✅ Added customBrandColor preference
```

### 3. הוספה ל-HTML

```html
<div class="mb-3">
    <label for="customBrandColor" class="form-label">צבע מותאם למותג</label>
    <input type="color" 
           class="form-control form-control-color" 
           id="customBrandColor"
           data-preference="customBrandColor"
           data-color-key="customBrandColor">
    <small class="form-text text-muted">בחר צבע למותג שלך</small>
</div>
```

### 4. בדיקה

```bash
# בדיקה שההעדפה נוספה לבסיס הנתונים
curl "http://127.0.0.1:8080/api/preferences/user/preference?name=customBrandColor&user_id=1"
```

תגובה צפויה:
```json
{
  "success": true,
  "data": {
    "preference_name": "customBrandColor",
    "value": "#007bff",
    "user_id": 1
  }
}
```

### 5. Commit

```bash
git add -A
git commit -m "✅ Added customBrandColor preference

- Created migration script
- Added color picker to preferences.html
- Tested API endpoint"
```

---

## קבוצות העדפות זמינות (Preference Groups)

| ID | שם | תיאור |
|----|-----|-------|
| 1 | General | הגדרות כלליות |
| 2 | Filters | פילטרים |
| 3 | Colors | צבעים |
| 4 | Notifications | התראות |
| 5 | Display | תצוגה |

---

## טיפוסי נתונים זמינים (Data Types)

| Type | תיאור | דוגמה |
|------|--------|-------|
| `string` | מחרוזת | "USD", "#007bff" |
| `number` | מספר | 25, 100.50 |
| `boolean` | בוליאני | true, false |
| `json` | JSON object | {"key": "value"} |

---

## שגיאות נפוצות

### שגיאה: "Preference type not found"

**סיבה:** ההעדפה לא קיימת בבסיס הנתונים.

**פתרון:**
1. בדוק ש-migration script רץ בהצלחה
2. בדוק ששם ההעדפה זהה ב-HTML וב-DB
3. נקה cache:
```bash
curl -X POST "http://127.0.0.1:8080/api/cache/clear"
```

### שגיאה: "Cannot save preference"

**סיבה:** Validation נכשל או ההעדפה לא פעילה.

**פתרון:**
1. בדוק ש-`is_active = TRUE` בבסיס הנתונים
2. בדוק ש-`data_type` תואם לערך שנשלח
3. בדוק constraints אם יש

---

## Best Practices

### 1. שמות העדפות (Naming Convention)

- השתמש ב-camelCase: `myNewPreference`
- היה תיאורי: `defaultAccountFilter` במקום `daf`
- השתמש ב-prefix לקבוצה: `notification_system_enabled`

### 2. ערכי ברירת מחדל (Default Values)

- תמיד הגדר ערך ברירת מחדל הגיוני
- לצבעים: השתמש בהקס (`#007bff`)
- למספרים: השתמש בערכים סבירים (25, לא 999999)
- לבוליאנים: `true` או `false`

### 3. תיעוד (Documentation)

- הוסף תיאור ברור בעברית ב-`description`
- הוסף `small` tag ב-HTML עם הסבר
- עדכן את המדריך הזה אם יש שינוי משמעותי

### 4. בדיקות (Testing)

- בדוק את ההעדפה ב-API לפני commit
- בדוק שההעדפה נשמרת ונטענת כראוי
- בדוק שניקוי cache עובד

---

## טיפים מתקדמים

### הוספת Constraints

אפשר להוסף constraints לוולידציה:

```python
{
    'name': 'maxItemsPerPage',
    'group_id': 1,
    'data_type': 'number',
    'description': 'מספר פריטים מקסימלי לעמוד',
    'default_value': '100',
    'constraints': '{"min": 10, "max": 1000}',  # JSON string
    'is_required': False
}
```

### הוספת העדפות מרובות בבת אחת

```python
preferences = [
    {
        'name': 'pref1',
        'group_id': 1,
        'data_type': 'string',
        'description': 'תיאור 1',
        'default_value': 'value1'
    },
    {
        'name': 'pref2',
        'group_id': 1,
        'data_type': 'number',
        'description': 'תיאור 2',
        'default_value': '50'
    }
]

for pref in preferences:
    cursor.execute('''
        INSERT INTO preference_types (...)
        VALUES (...)
    ''', (...))
```

---

## סיכום Checklist

- [ ] יצרתי migration script
- [ ] הרצתי את המיגרציה בהצלחה
- [ ] הוספתי input field ל-HTML
- [ ] בדקתי שההעדפה נטענת מה-API
- [ ] בדקתי שניתן לשמור את ההעדפה
- [ ] ביצעתי commit עם הודעה תיאורית

---

## קישורים נוספים

- [Preferences System Documentation](frontend/PREFERENCES_SYSTEM.md)
- [Backend Preferences Service](../Backend/services/preferences_service.py)
- [Frontend Preferences Core](../trading-ui/scripts/preferences-core.js)
- [HTML Preferences Page](../trading-ui/preferences.html)

---

**שאלות?** פנה לצוות הפיתוח או בדוק את התיעוד המלא במערכת.

