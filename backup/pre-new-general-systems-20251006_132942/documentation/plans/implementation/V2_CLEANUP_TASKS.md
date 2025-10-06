# 🧹 משימות ניקוי V2 - TikTrack Preferences System

## 📋 **סיכום כללי**

מסמך זה מכיל את כל המשימות הנדרשות להסרת כל ההתייחסויות ל-V2 מהמערכת ולהפיכתה למערכת preferences יחידה ונקייה.

**תאריך יצירה:** 6 בינואר 2025  
**סטטוס:** 🔄 בתהליך - חלקי  
**עדיפות:** 🔴 גבוהה  
**עדכון אחרון:** 6 בינואר 2025 - בדיקות מערכת  

---

## 🎯 **מטרות המשימה**

1. **הסרת כל ההתייחסויות ל-V2** מהמערכת
2. **מיגרציה של בסיס הנתונים** מטבלאות V2 לטבלאות רגילות
3. **תיקון שמות קבצים** ופונקציות
4. **עדכון דוקומנטציה** מלאה
5. **בדיקות תקינות** מקיפות

---

## 🗄️ **שלב 1: מיגרציה של בסיס הנתונים (קריטי)**

### **1.1 טבלאות קיימות בבסיס הנתונים**
```sql
-- טבלאות V2 שצריכות מיגרציה:
user_preferences_v2     -- טבלה ראשית V2 (2 רשומות, 80+ שדות)
preference_profiles     -- פרופילים V2 (1 רשומה)
preference_history      -- היסטוריה V2 (1 רשומה)

-- טבלאות קיימות (ישנות):
user_preferences        -- טבלה ישנה (1 רשומה, 30+ שדות)
user_data_preferences   -- טבלה ישנה
```

### **1.2 החלטה על אסטרטגיה**
**בעיה:** `user_preferences_v2` מכילה 80+ שדות בעוד `user_preferences` מכילה רק 30+ שדות

**אפשרויות:**
1. **להשאיר את `user_preferences_v2`** ולשנות את המודל להצביע עליה
2. **להעביר נתונים** מ-`user_preferences_v2` ל-`user_preferences` (עם אובדן נתונים)

**החלטה מומלצת:** אפשרות 1 - להשאיר את הטבלה המפורטת

### **1.3 מיגרציה נדרשת**
- [x] ✅ **גיבוי בסיס הנתונים** לפני כל שינוי - הושלם
- [x] ✅ **בדיקת מבנה הטבלאות** והשוואה - הושלם
- [x] ✅ **החלטה על אסטרטגיה** (השארת V2 או מיגרציה) - הוחלט להשאיר V2
- [x] ✅ **עדכון המודל** להצביע על הטבלה הנכונה - הושלם (חזרה ל-user_preferences_v2)
- [ ] ❌ **מיגרציה של נתונים** (אם נדרש) - לא נדרש
- [ ] ❌ **מחיקת טבלאות V2** (אם נדרש) - לא נדרש
- [x] ✅ **בדיקת תקינות** הנתונים אחרי המיגרציה - הושלם

### **1.4 קבצים רלוונטיים**
- `Backend/db/simpleTrade_new.db` - בסיס הנתונים
- `Backend/migrations/migration_20250903_172852_create_user_preferences_table.json` - מיגרציה קיימת
- `Backend/scripts/migrate_preferences_v1_to_v2.py` - סקריפט מיגרציה קיים
- `Backend/scripts/simple_migrate_v1_to_v2.py` - סקריפט מיגרציה פשוט
- `Backend/test_v2_system.py` - בדיקות מערכת V2

### **1.5 דוקומנטציה רלוונטית**
- [📊 V2 Final Report](./PREFERENCES_V2_FINAL_COMPLETION_REPORT.md) - דוח סופי V2
- [🔧 V2 Defaults Architecture](./PREFERENCES_V2_DEFAULTS_ARCHITECTURE.md) - ארכיטקטורת ברירות מחדל
- [⚖️ V1 vs V2 Comparison](./PREFERENCES_V1_VS_V2_COMPARISON.md) - השוואה V1 מול V2
- [✅ V2 Mission Accomplished](./PREFERENCES_V2_MISSION_ACCOMPLISHED.md) - משימה הושלמה

---

## 🔧 **שלב 2: תיקון קבצי Backend**

### **2.1 Backend/models/user_preferences.py**
- [x] ✅ **תוקן** - `__tablename__ = 'user_preferences_v2'` (חזרה לטבלה הפעילה)
- [x] ✅ **תוקן** - כותרת הקובץ
- [x] ✅ **תוקן** - תיאור הקלאס
- [x] ✅ **תוקן** - פונקציה `__repr__`
- [x] ✅ **תוקן** - פונקציה `import_settings`

### **2.2 Backend/services/preferences_service.py**
- [x] ✅ **תוקן** - כותרת הקובץ
- [x] ✅ **תוקן** - תיאור הקלאס
- [x] ✅ **תוקן** - פונקציה `get_preferences_v2` → `get_preferences`
- [x] ✅ **תוקן** - פונקציה `update_preferences_v2` → `update_preferences`
- [x] ✅ **תוקן** - פונקציה `migrate_from_v1` (התייחסויות ל-V1/V2) - הושלם
- [x] ✅ **תוקן** - פונקציה `_map_v1_to_v2` (התייחסויות ל-V1/V2) - הושלם
- [x] ✅ **תוקן** - משתנים `v1_preferences`, `v2_preferences` - הושלם
- [x] ✅ **תוקן** - הודעות לוג עם V1/V2 - הושלם
- [x] ✅ **תוקן** - משתנה `total_users_v2` - הושלם

### **2.3 Backend/routes/api/preferences_v2.py**
- [x] ✅ **הושלם** - הקובץ נמחק (היה preferences.py זמני)
- [x] ✅ **הושלם** - שמות פונקציות - הושלם
- [x] ✅ **הושלם** - שמות משתנים - הושלם
- [x] ✅ **הושלם** - התייחסויות ל-V2 - הושלם

### **2.4 קבצים רלוונטיים**
- `Backend/routes/api/preferences_v2.py` - API routes V2
- `Backend/routes/api/js_map.py` - מיפוי קבצי JS
- `Backend/routes/pages.py` - routes לעמודים
- `Backend/app.py` - אפליקציה ראשית

### **2.5 דוקומנטציה רלוונטית**
- [🔧 Preferences API](./documentation/features/preferences/API.md) - API העדפות
- [🏗️ JavaScript Architecture](./documentation/frontend/JAVASCRIPT_ARCHITECTURE.md) - ארכיטקטורת JavaScript
- [📁 JS Organization](./documentation/frontend/JS_ORGANIZATION.md) - ארגון קבצי JS

### **2.4 Backend/scripts/migrate_preferences_v1_to_v2.py**
- [ ] ❌ **צריך תיקון** - שם הקובץ → `migrate_preferences.py`
- [ ] ❌ **צריך תיקון** - שמות פונקציות
- [ ] ❌ **צריך תיקון** - שמות משתנים
- [ ] ❌ **צריך תיקון** - התייחסויות ל-V2

### **2.5 Backend/test_v2_system.py**
- [ ] ❌ **צריך תיקון** - התייחסויות ל-`user_preferences_v2`
- [ ] ❌ **צריך תיקון** - שמות טבלאות
- [ ] ❌ **צריך תיקון** - שם הקובץ → `test_preferences_system.py`

### **2.6 Backend/scripts/simple_migrate_v1_to_v2.py**
- [ ] ❌ **צריך תיקון** - התייחסויות ל-`user_preferences_v2`
- [ ] ❌ **צריך תיקון** - שם הקובץ → `simple_migrate_preferences.py`

---

## 🚨 **משימות קריטיות שנותרו (עדיפות גבוהה)**

### **משימות Backend שנותרו:**
- [ ] ❌ **בדיקת API endpoints** - וידוא שכל ה-endpoints עובדים
- [ ] ❌ **תיקון SQLAlchemy mapper errors** - עדיין יש שגיאות בלוגים
- [ ] ❌ **בדיקת קשרים בין מודלים** - User ↔ UserPreferences ↔ PreferenceProfile
- [ ] ❌ **ניקוי קבצי V2 ישנים** - מחיקת קבצים שלא בשימוש

### **משימות Frontend שנותרו:**
- [ ] ❌ **בדיקת עמוד preferences** - וידוא שהעמוד עובד
- [ ] ❌ **בדיקת JavaScript functions** - וידוא שכל הפונקציות עובדות
- [ ] ❌ **בדיקת קישורים** - וידוא שכל הקישורים עובדים

### **משימות בסיס נתונים שנותרו:**
- [ ] ❌ **ניקוי טבלאות לא בשימוש** - user_data_preferences (ריקה)
- [ ] ❌ **בדיקת אינטגריטי** - וידוא שכל הקשרים תקינים
- [ ] ❌ **אופטימיזציה** - ניקוי נתונים ישנים

### **משימות בדיקה שנותרו:**
- [ ] ❌ **בדיקת השרת** - וידוא שהשרת עובד ללא שגיאות
- [ ] ❌ **בדיקת API** - וידוא שכל ה-endpoints עובדים
- [ ] ❌ **בדיקת Frontend** - וידוא שכל העמודים עובדים
- [ ] ❌ **בדיקת אינטגרציה** - וידוא שהכל עובד יחד

---

## 🎨 **שלב 3: תיקון קבצי Frontend**

### **3.1 trading-ui/scripts/preferences-v2.js**
- [ ] ❌ **צריך תיקון** - שם הקובץ → `preferences.js`
- [ ] ❌ **צריך תיקון** - שמות פונקציות
  - [ ] בדיקת כל הפונקציות בקובץ (כ-50+ פונקציות)
  - [ ] החלפת שמות עם V2
- [ ] ❌ **צריך תיקון** - שמות משתנים
  - [ ] בדיקת כל המשתנים בקובץ
  - [ ] החלפת שמות עם V2
- [ ] ❌ **צריך תיקון** - התייחסויות ל-V2
  - [ ] בדיקת כל ההתייחסויות בקובץ
  - [ ] החלפת התייחסויות ל-V2

### **3.2 trading-ui/scripts/preferences-v2-compatibility.js**
- [ ] ❌ **צריך תיקון** - שם הקובץ → `preferences-compatibility.js`
- [ ] ❌ **צריך תיקון** - שמות פונקציות
  - [ ] בדיקת כל הפונקציות בקובץ
  - [ ] החלפת שמות עם V2
- [ ] ❌ **צריך תיקון** - שמות משתנים
  - [ ] בדיקת כל המשתנים בקובץ
  - [ ] החלפת שמות עם V2
- [ ] ❌ **צריך תיקון** - התייחסויות ל-V2
  - [ ] בדיקת כל ההתייחסויות בקובץ
  - [ ] החלפת התייחסויות ל-V2

### **3.3 trading-ui/preferences-v2.html**
- [ ] ❌ **צריך תיקון** - שם הקובץ → `preferences.html`
- [ ] ❌ **צריך תיקון** - התייחסויות בקוד
  - [ ] בדיקת כל ההתייחסויות בקובץ
  - [ ] החלפת התייחסויות ל-V2
- [ ] ❌ **צריך תיקון** - קישורים לקבצי JS
  - [ ] עדכון קישורים ל-`preferences.js`
  - [ ] עדכון קישורים ל-`preferences-compatibility.js`

### **3.4 קבצי HTML אחרים**
- [ ] ❌ **צריך תיקון** - `trading-ui/index.html` - קישורים ל-V2
  - [ ] עדכון קישורים ל-`preferences.html`
  - [ ] עדכון קישורים ל-`preferences.js`
- [ ] ❌ **צריך תיקון** - `trading-ui/tickers.html` - קישורים ל-V2
  - [ ] עדכון קישורים ל-`preferences.js`
- [ ] ❌ **צריך תיקון** - `trading-ui/executions.html` - קישורים ל-V2
  - [ ] עדכון קישורים ל-`preferences.js`

### **3.5 קבצים רלוונטיים**
- `trading-ui/scripts/preferences-v2.js` - JavaScript ראשי V2
- `trading-ui/scripts/preferences-v2-compatibility.js` - שכבת תאימות V2
- `trading-ui/preferences-v2.html` - עמוד HTML V2
- `trading-ui/index.html` - דף הבית
- `trading-ui/tickers.html` - עמוד טיקרים
- `trading-ui/executions.html` - עמוד ביצועים

### **3.6 דוקומנטציה רלוונטית**
- [🎨 Frontend README](./documentation/frontend/README.md) - מדריך Frontend
- [🏗️ JavaScript Architecture](./documentation/frontend/JAVASCRIPT_ARCHITECTURE.md) - ארכיטקטורת JavaScript
- [📁 JS Organization](./documentation/frontend/JS_ORGANIZATION.md) - ארגון קבצי JS
- [🔔 Notification System](./documentation/frontend/NOTIFICATION_SYSTEM.md) - מערכת התראות

---

## 📚 **שלב 4: עדכון דוקומנטציה**

### **4.1 קבצי דוקומנטציה עיקריים**
- [ ] ❌ **צריך תיקון** - `documentation/INDEX.md`
  - [ ] עדכון קישורים ל-V2
  - [ ] הסרת התייחסויות ל-V1
- [ ] ❌ **צריך תיקון** - `documentation/features/preferences/INDEX.md`
  - [ ] עדכון קישורים ל-V2
  - [ ] הסרת התייחסויות ל-V1
- [ ] ❌ **צריך תיקון** - `documentation/frontend/README.md`
  - [ ] עדכון קישורים ל-V2
  - [ ] הסרת התייחסויות ל-V1
- [ ] ❌ **צריך תיקון** - `documentation/frontend/JAVASCRIPT_ARCHITECTURE.md`
  - [ ] עדכון קישורים ל-V2
  - [ ] הסרת התייחסויות ל-V1
- [ ] ❌ **צריך תיקון** - `documentation/frontend/JS_ORGANIZATION.md`
  - [ ] עדכון קישורים ל-V2
  - [ ] הסרת התייחסויות ל-V1

### **4.2 קבצי דוקומנטציה נוספים**
- [ ] ❌ **צריך תיקון** - `documentation/development/README.md`
  - [ ] עדכון קישורים ל-V2
  - [ ] הסרת התייחסויות ל-V1
- [ ] ❌ **צריך תיקון** - `documentation/development/NOTIFICATION_SYSTEM_IMPLEMENTATION.md`
  - [ ] עדכון קישורים ל-V2
  - [ ] הסרת התייחסויות ל-V1
- [ ] ❌ **צריך תיקון** - `documentation/USER_MANAGEMENT_SYSTEM.md`
  - [ ] עדכון קישורים ל-V2
  - [ ] הסרת התייחסויות ל-V1
- [ ] ❌ **צריך תיקון** - `JAVASCRIPT_ARCHITECTURE_ANALYSIS.md`
  - [ ] עדכון קישורים ל-V2
  - [ ] הסרת התייחסויות ל-V1
- [ ] ❌ **צריך תיקון** - `PREFERENCES_SYSTEM_ARCHITECTURE_SPECIFICATION.md`
  - [ ] עדכון קישורים ל-V2
  - [ ] הסרת התייחסויות ל-V1

### **4.3 קבצי דוח**
- [ ] ❌ **צריך תיקון** - `PREFERENCES_V2_MISSION_ACCOMPLISHED.md`
  - [ ] עדכון קישורים ל-V2
  - [ ] הסרת התייחסויות ל-V1
- [ ] ❌ **צריך תיקון** - `PREFERENCES_V2_FINAL_COMPLETION_REPORT.md`
  - [ ] עדכון קישורים ל-V2
  - [ ] הסרת התייחסויות ל-V1
- [ ] ❌ **צריך תיקון** - `PREFERENCES_V2_DEFAULTS_ARCHITECTURE.md`
  - [ ] עדכון קישורים ל-V2
  - [ ] הסרת התייחסויות ל-V1
- [ ] ❌ **צריך תיקון** - `PREFERENCES_V1_VS_V2_COMPARISON.md`
  - [ ] עדכון קישורים ל-V2
  - [ ] הסרת התייחסויות ל-V1
- [ ] ❌ **צריך תיקון** - `SITE_WIDE_V2_SCAN_REPORT.md`
  - [ ] עדכון קישורים ל-V2
  - [ ] הסרת התייחסויות ל-V1

### **4.4 קבצים רלוונטיים**
- `documentation/INDEX.md` - אינדקס ראשי
- `documentation/features/preferences/INDEX.md` - אינדקס העדפות
- `documentation/frontend/README.md` - מדריך Frontend
- `documentation/frontend/JAVASCRIPT_ARCHITECTURE.md` - ארכיטקטורת JavaScript
- `documentation/frontend/JS_ORGANIZATION.md` - ארגון קבצי JS
- `documentation/development/README.md` - מדריך פיתוח
- `documentation/development/NOTIFICATION_SYSTEM_IMPLEMENTATION.md` - מערכת התראות
- `documentation/USER_MANAGEMENT_SYSTEM.md` - מערכת משתמשים
- `JAVASCRIPT_ARCHITECTURE_ANALYSIS.md` - ניתוח JavaScript
- `PREFERENCES_SYSTEM_ARCHITECTURE_SPECIFICATION.md` - מפרט ארכיטקטורה

---

## ⚙️ **שלב 5: עדכון קבצי תצורה**

### **5.1 קבצי JSON**
- [ ] ❌ **צריך תיקון** - `Backend/config/preferences_defaults.json`
  - [ ] בדיקת התוכן להסיר התייחסויות ל-V2
  - [ ] עדכון שמות שדות אם נדרש
- [ ] ❌ **צריך תיקון** - קבצי תצורה אחרים
  - [ ] בדיקת כל קבצי התצורה
  - [ ] עדכון התייחסויות ל-V2

### **5.2 קבצי Python**
- [ ] ❌ **צריך תיקון** - `Backend/routes/api/js_map.py` - התייחסויות ל-V2
  - [ ] עדכון קישורים ל-`preferences.js`
  - [ ] עדכון קישורים ל-`preferences.html`
- [ ] ❌ **צריך תיקון** - `Backend/routes/pages.py` - התייחסויות ל-V2
  - [ ] עדכון קישורים ל-`preferences.html`
  - [ ] עדכון routes

### **5.3 קבצים רלוונטיים**
- `Backend/config/preferences_defaults.json` - ברירות מחדל
- `Backend/routes/api/js_map.py` - מיפוי קבצי JS
- `Backend/routes/pages.py` - routes לעמודים
- `Backend/app.py` - אפליקציה ראשית

### **5.4 דוקומנטציה רלוונטית**
- [🔧 Preferences API](./documentation/features/preferences/API.md) - API העדפות
- [🏗️ JavaScript Architecture](./documentation/frontend/JAVASCRIPT_ARCHITECTURE.md) - ארכיטקטורת JavaScript
- [📁 JS Organization](./documentation/frontend/JS_ORGANIZATION.md) - ארגון קבצי JS

---

## 🧪 **שלב 6: בדיקות תקינות**

### **6.1 בדיקות בסיס הנתונים**
- [ ] **בדיקת תקינות** טבלאות אחרי מיגרציה
  - [ ] בדיקת מבנה הטבלאות
  - [ ] בדיקת אינדקסים
  - [ ] בדיקת constraints
- [ ] **בדיקת תקינות** נתונים אחרי מיגרציה
  - [ ] בדיקת שלמות הנתונים
  - [ ] בדיקת תקינות הערכים
  - [ ] בדיקת קשרים בין רשומות
- [ ] **בדיקת תקינות** קשרים בין טבלאות
  - [ ] בדיקת foreign keys
  - [ ] בדיקת relationships
  - [ ] בדיקת cascade rules

### **6.2 בדיקות API**
- [ ] **בדיקת תקינות** API endpoints
  - [ ] בדיקת כל ה-endpoints
  - [ ] בדיקת response codes
  - [ ] בדיקת error handling
- [ ] **בדיקת תקינות** פונקציות שירות
  - [ ] בדיקת business logic
  - [ ] בדיקת error handling
  - [ ] בדיקת performance
- [ ] **בדיקת תקינות** מיגרציה
  - [ ] בדיקת data migration
  - [ ] בדיקת schema changes
  - [ ] בדיקת rollback procedures

### **6.3 בדיקות Frontend**
- [ ] **בדיקת תקינות** טעינת עמודים
  - [ ] בדיקת HTML structure
  - [ ] בדיקת CSS styling
  - [ ] בדיקת responsive design
- [ ] **בדיקת תקינות** פונקציות JavaScript
  - [ ] בדיקת function calls
  - [ ] בדיקת error handling
  - [ ] בדיקת performance
- [ ] **בדיקת תקינות** קישורים
  - [ ] בדיקת internal links
  - [ ] בדיקת external links
  - [ ] בדיקת broken links

### **6.4 קבצים רלוונטיים**
- `Backend/test_v2_system.py` - בדיקות מערכת V2
- `test_full_v2_integration.py` - בדיקת אינטגרציה מלאה V2
- `test-preferences-v2-integration.html` - בדיקת אינטגרציה HTML V2

### **6.5 דוקומנטציה רלוונטית**
- [🧪 Testing Guide](./documentation/testing/TESTING_AND_VALIDATION.md) - מדריך בדיקות
- [🔧 Development README](./documentation/development/README.md) - מדריך פיתוח
- [📊 Performance Report](./Backend/PERFORMANCE_IMPROVEMENTS_REPORT.md) - דוח ביצועים

---

## 📊 **מצב נוכחי - סיכום בדיקות (6 בינואר 2025)**

### **✅ מה שהושלם:**
- **בסיס הנתונים:** בריא, 33 טבלאות, אינטגריטי תקין
- **טבלאות העדפות:** `user_preferences_v2` פעילה עם 2 רשומות
- **מודלים:** `UserPreferences` מצביע על `user_preferences_v2`
- **שירותים:** `PreferencesService` עם שמות סטנדרטיים
- **Git:** נוקה מ-.venv, כל השינויים נשמרו
- **שרת:** עובד, API health תקין

### **❌ מה שנותר:**
- **SQLAlchemy mapper errors** - עדיין יש שגיאות בלוגים
- **API endpoints** - לא נבדקו כל ה-endpoints
- **Frontend** - לא נבדקו עמודי preferences
- **קבצי V2** - עדיין קיימים בפרונט
- **דוקומנטציה** - לא עודכנה

### **🎯 עדיפויות:**
1. **קריטי:** תיקון SQLAlchemy mapper errors
2. **גבוה:** בדיקת API endpoints
3. **בינוני:** בדיקת Frontend
4. **נמוך:** עדכון דוקומנטציה

---

## 📊 **סיכום המשימות**

### **סטטיסטיקות**
- **סה"כ שלבים:** 6
- **סה"כ משימות:** 50+
- **משימות שהושלמו:** 15+ (30%)
- **משימות שנותרו:** 35+ (70%)
- **קבצים מעורבים:** 30+
- **דוקומנטציה מעורבת:** 20+

### **עדיפויות**
1. **קריטי** - מיגרציה של בסיס הנתונים
2. **גבוה** - תיקון קבצי Backend
3. **בינוני** - תיקון קבצי Frontend
4. **נמוך** - עדכון דוקומנטציה

### **הערות חשובות**
- ⚠️ **גיבוי חובה** לפני כל שינוי בבסיס הנתונים
- 🔄 **בדיקות תקינות** אחרי כל שלב
- 📝 **תיעוד שינויים** בכל שלב
- 🚫 **אין לשבור** פונקציונליות קיימת

---

## 📖 **קישורים לדוקומנטציה רלוונטית**

### **דוקומנטציה עיקרית**
- [📋 INDEX.md](./documentation/INDEX.md) - אינדקס ראשי
- [🎨 Frontend README](./documentation/frontend/README.md) - מדריך Frontend
- [⚙️ Preferences INDEX](./documentation/features/preferences/INDEX.md) - אינדקס העדפות

### **דוקומנטציה טכנית**
- [🏗️ JavaScript Architecture](./documentation/frontend/JAVASCRIPT_ARCHITECTURE.md) - ארכיטקטורת JavaScript
- [📁 JS Organization](./documentation/frontend/JS_ORGANIZATION.md) - ארגון קבצי JS
- [🔧 Preferences API](./documentation/features/preferences/API.md) - API העדפות

### **דוקומנטציה פיתוח**
- [🛠️ Development README](./documentation/development/README.md) - מדריך פיתוח
- [🔔 Notification System](./documentation/development/NOTIFICATION_SYSTEM_IMPLEMENTATION.md) - מערכת התראות
- [👥 User Management](./documentation/USER_MANAGEMENT_SYSTEM.md) - מערכת משתמשים

### **דוחות וניתוחים**
- [📊 JavaScript Analysis](./JAVASCRIPT_ARCHITECTURE_ANALYSIS.md) - ניתוח JavaScript
- [🏗️ Preferences Architecture](./PREFERENCES_SYSTEM_ARCHITECTURE_SPECIFICATION.md) - מפרט ארכיטקטורה
- [✅ V2 Mission Accomplished](./PREFERENCES_V2_MISSION_ACCOMPLISHED.md) - משימה הושלמה
- [📋 V2 Final Report](./PREFERENCES_V2_FINAL_COMPLETION_REPORT.md) - דוח סופי
- [🔧 V2 Defaults Architecture](./PREFERENCES_V2_DEFAULTS_ARCHITECTURE.md) - ארכיטקטורת ברירות מחדל
- [⚖️ V1 vs V2 Comparison](./PREFERENCES_V1_VS_V2_COMPARISON.md) - השוואה V1 מול V2
- [🔍 Site Wide V2 Scan](./SITE_WIDE_V2_SCAN_REPORT.md) - סריקה מקיפה

---

## ⚠️ **הערות חשובות**

### **סדר ביצוע מומלץ**
1. **מיגרציה של בסיס הנתונים** (קריטי - לא לעבוד על זה במקביל)
2. **תיקון קבצי Backend** (חשוב - תלוי במיגרציה)
3. **תיקון קבצי Frontend** (חשוב - תלוי ב-Backend)
4. **עדכון דוקומנטציה** (פחות קריטי)
5. **בדיקות תקינות** (חובה אחרי כל שלב)

### **גיבויים נדרשים**
- [ ] **גיבוי בסיס הנתונים** לפני מיגרציה
- [ ] **גיבוי קבצי Backend** לפני שינויים
- [ ] **גיבוי קבצי Frontend** לפני שינויים

### **בדיקות נדרשות**
- [ ] **בדיקת השרת** אחרי כל שינוי
- [ ] **בדיקת API** אחרי כל שינוי
- [ ] **בדיקת Frontend** אחרי כל שינוי

---

## 📊 **סטטיסטיקות**

**סה"כ משימות:** 50+  
**משימות קריטיות:** 15  
**משימות חשובות:** 25  
**משימות פחות קריטיות:** 10+  

**זמן משוער:** 2-3 שעות עבודה שיטתית  
**רמת סיכון:** 🔴 גבוהה (שינויים בבסיס הנתונים)  

---

## 🎯 **השלב הבא**

**מומלץ להתחיל עם:** תיקון SQLAlchemy mapper errors  
**סיבה:** זה הבעיה הקריטית שמונעת מהמערכת לעבוד חלק  
**זמן משוער:** 15-30 דקות  
**אחרי זה:** בדיקת API endpoints  

---

## 📋 **מידע על הקובץ**

**📅 נוצר:** 2025-01-03  
**👤 יוצר:** AI Assistant  
**🎯 מטרה:** ניקוי מלא של V1 ו-V2 מהמערכת  
**📁 מיקום:** `/Users/nimrod/Documents/TikTrack/TikTrackApp/V2_CLEANUP_TASKS.md`  
**🔄 עדכון אחרון:** 2025-01-06 16:45 - בדיקות מערכת וסיכום מצב  

### **איך להשתמש בקובץ זה**
1. **קרא את כל השלבים** לפני התחלה
2. **בצע גיבוי** לפני כל שינוי
3. **עבור שלב אחר שלב** לפי הסדר
4. **סמן משימות שהושלמו** עם ✅
5. **תעד בעיות** אם יש

### **קישורים מהירים**
- [ חזרה לתחילת הקובץ](#-משימות-ניקוי-v2-מפורטות)
- [️ שלב 1: מיגרציה של בסיס הנתונים](#️-שלב-1-מיגרציה-של-בסיס-הנתונים-קריטי)
- [🔧 שלב 2: תיקון קבצי Backend](#-שלב-2-תיקון-קבצי-backend)
- [🎨 שלב 3: תיקון קבצי Frontend](#-שלב-3-תיקון-קבצי-frontend)
- [📚 שלב 4: עדכון דוקומנטציה](#-שלב-4-עדכון-דוקומנטציה)
- [⚙️ שלב 5: עדכון קבצי תצורה](#️-שלב-5-עדכון-קבצי-תצורה)
- [🧪 שלב 6: בדיקות תקינות](#-שלב-6-בדיקות-תקינות)

---

**נוצר על ידי:** AI Assistant  
**תאריך:** 6 בינואר 2025  
**גרסה:** 1.0  
