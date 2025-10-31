# תיקון מערכת הפרופילים - TikTrack

**תאריך:** 29 אוקטובר 2025  
**מטרה:** וידוא שכל התהליכים מטפלים נכון בפרופיל ברירת מחדל כפרופיל מיוחד

---

## ✅ תהליכים שתוקנו

### 1. `get_user_profiles(user_id)` ✅
**מיקום:** `Backend/services/preferences_service.py:865`

**מה שתוקן:**
- מחזירה תמיד את פרופיל ברירת המחדל (ID: 0) ברשימה **לכל משתמש**
- מחזירה את כל הפרופילים של המשתמש הספציפי
- פרופיל ברירת המחדל מוצג כפעיל רק אם אין פרופיל פעיל אחר של המשתמש
- פרופיל ברירת המחדל מופיע ראשון ברשימה

**לוגיקה:**
```python
# Get user profiles
WHERE user_id = ?

# Get default profile (special system profile)
WHERE user_id = 0 AND is_default = 1

# Add default profile first + all user profiles
```

---

### 2. `activate_profile(user_id, profile_id)` ✅
**מיקום:** `Backend/services/preferences_service.py:934`

**מה שתוקן:**
- מטפלת בפרופיל ברירת המחדל (ID: 0) כמיוחד - **לא משנה את המסד הנתונים**
- כשמחליפים לפרופיל רגיל, מפעילה אותו במסד הנתונים כראוי
- מבטלת הפעלה מכל הפרופילים של המשתמש לפני הפעלת הפרופיל החדש

**לוגיקה:**
```python
if profile_id == 0:
    # פרופיל ברירת מחדל מיוחד - לא צריך להפעיל במסד הנתונים
    return True
else:
    # הפעל פרופיל רגיל במסד הנתונים
```

---

### 3. `_get_active_profile_id(user_id)` ✅
**מיקום:** `Backend/services/preferences_service.py:207`

**מה שתוקן:**
- אם אין פרופיל פעיל של המשתמש, מחזיר פרופיל ברירת מחדל (ID: 0)
- לא זורק שגיאה אם אין פרופיל פעיל - מחזיר ברירת מחדל

**לוגיקה:**
```python
# חפש פרופיל פעיל של המשתמש
WHERE user_id = ? AND is_active = TRUE

# אם לא נמצא - מחזיר 0 (פרופיל ברירת מחדל)
if not result:
    return 0
```

---

### 4. `get_all_user_preferences(user_id, profile_id)` ✅
**מיקום:** `Backend/services/preferences_service.py:534`

**מה שתוקן:**
- כש-`profile_id == 0` (פרופיל ברירת מחדל), מחזיר רק ערכי ברירת מחדל מ-`preference_types`
- לא מחפש ב-`user_preferences` עבור פרופיל ברירת מחדל

**לוגיקה:**
```python
if profile_id == 0:
    # מחזיר רק default_value מ-preference_types
    SELECT pt.preference_name, pt.default_value as value...
else:
    # מחזיר מ-user_preferences או ברירת מחדל
    SELECT ... COALESCE(up.saved_value, pt.default_value)...
```

---

### 5. `get_preference(user_id, preference_name, profile_id)` ✅
**מיקום:** `Backend/services/preferences_service.py:318`

**מה שתוקן:**
- כש-`profile_id == 0` (פרופיל ברירת מחדל), מחזיר ישירות ערך ברירת מחדל מ-`preference_types`
- לא מחפש ב-`user_preferences` עבור פרופיל ברירת מחדל

**לוגיקה:**
```python
if profile_id == 0:
    # מחזיר רק default_value מ-preference_types
    SELECT default_value, data_type FROM preference_types...
else:
    # מחפש ב-user_preferences או מחזיר ברירת מחדל
```

---

### 6. `get_preferences_by_names(user_id, preference_names, profile_id)` ✅
**מיקום:** `Backend/services/preferences_service.py:492`

**מה שתוקן:**
- כש-`profile_id == 0` (פרופיל ברירת מחדל), מחזיר רק ערכי ברירת מחדל
- לא מחפש ב-`user_preferences` עבור פרופיל ברירת מחדל

**לוגיקה:**
```python
if profile_id == 0:
    # מחזיר רק default_value מ-preference_types
    SELECT pt.preference_name, NULL as saved_value, pt.default_value...
else:
    # מחזיר מ-user_preferences או ברירת מחדל
```

---

### 7. `get_group_preferences(user_id, group_name, profile_id)` ✅
**מיקום:** `Backend/services/preferences_service.py:430`

**מה שתוקן:**
- כש-`profile_id == 0` (פרופיל ברירת מחדל), מחזיר רק ערכי ברירת מחדל
- לא מחפש ב-`user_preferences` עבור פרופיל ברירת מחדל

**לוגיקה:**
```python
if profile_id == 0:
    # מחזיר רק default_value מ-preference_types
    SELECT pt.preference_name, pt.default_value as value...
else:
    # מחזיר מ-user_preferences או ברירת מחדל
```

---

## 📋 סיכום

### פרופיל ברירת מחדל (ID: 0):
- ✅ **מיוחד וזהה לכל המשתמשים** (`user_id = 0`)
- ✅ **מופיע ברשימת הפרופילים לכל משתמש**
- ✅ **לא צריך להיות מופעל במסד הנתונים** - תמיד זמין
- ✅ **מחזיר רק ערכי ברירת מחדל** מ-`preference_types` (לא מ-`user_preferences`)

### פרופילי משתמש:
- ✅ **שייכים למשתמש ספציפי** (`user_id = משתמש`)
- ✅ **מופיעים ברשימת הפרופילים של המשתמש**
- ✅ **צריכים להיות מופעלים במסד הנתונים** (`is_active = 1`)
- ✅ **מחזירים ערכים מ-`user_preferences` או ברירת מחדל**

---

## ✅ בדיקה סופית

**טבלת פרופילים נוכחית:**
```
ID: 0, user_id: 0, name: "ברירת מחדל", is_active: 0, is_default: 1  ✅
ID: 2, user_id: 1, name: "פרופיל-נימרוד1", is_active: 1, is_default: 0  ✅
```

**כל התהליכים מעודכנים ומטפלים נכון בפרופיל ברירת המחדל כפרופיל מיוחד!**

