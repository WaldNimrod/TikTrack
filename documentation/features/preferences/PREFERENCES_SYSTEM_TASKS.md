# מערכת העדפות - קובץ משימות מפורט
## Preferences System - Detailed Task File

> **גרסה 1.0** - מערכת העדפות גמישה ומתקדמת

---

## 🎯 סקירה כללית

מערכת העדפות היא מערכת גמישה ומתקדמת המאפשרת ניהול העדפות משתמשים עם פרופילים מרובים, cache אגרסיבי, ונגישות קלה לכל המערכת.

---

## 📋 משימות לפי סדר עדיפות

### **שלב 1: הכנת בסיס הנתונים (Priority: Critical)**

#### **1.1 יצירת טבלאות חדשות**
- [ ] **יצירת טבלת `preference_groups`**
  - עמודות: id, group_name, description, created_at, updated_at
  - מילוי נתונים בסיסיים: general, colors, filters, ui, external_data, notifications

- [ ] **יצירת טבלת `preference_types`**
  - עמודות: id, group_id, data_type, preference_name, description, constraints, default_value, is_required, is_active
  - מילוי כל סוגי ההעדפות הקיימות
  - הגדרת constraints ו-default values

- [ ] **עדכון טבלת `preference_profiles`**
  - וידוא מבנה נכון
  - הוספת אינדקסים לביצועים

- [ ] **יצירת טבלת `user_preferences` החדשה**
  - עמודות: id, user_id, profile_id, preference_id, saved_value, created_at, updated_at
  - אינדקסים לביצועים מקסימליים

#### **1.2 אינדקסים ואופטימיזציה**
- [ ] **יצירת אינדקסים קריטיים**
  - `idx_user_preferences_lookup` על (user_id, profile_id, preference_id)
  - `idx_preference_types_active` על (is_active, group_id)
  - `idx_preference_profiles_user_active` על (user_id, is_active)

- [ ] **אינדקס מורכב לשאילתות מהירות**
  - `idx_user_preferences_complex` עם INCLUDE clause

#### **🔍 בדיקה + קריאה חוזרת לדוקומנטציה**
- [ ] **בדיקת מבנה הטבלאות** - וידוא שכל העמודות נוצרו נכון
- [ ] **קריאה חוזרת ב-`DATABASE_SCHEMA.md`** - השוואה עם הדוקומנטציה
- [ ] **בדיקת אינדקסים** - וידוא שכל האינדקסים נוצרו
- [ ] **בדיקת constraints** - וידוא שכל האילוצים מוגדרים

---

### **שלב 2: מיגרציה מנתונים קיימים (Priority: High)**

#### **2.1 העברת נתונים קיימים**
- [ ] **יצירת סקריפט מיגרציה**
  - קריאת נתונים מ-`user_preferences` הישן
  - המרה למבנה החדש
  - שמירה כנתוני ברירת מחדל ב-`preference_types`

- [ ] **יצירת פרופיל "נימרוד" לדוגמה**
  - פרופיל עם כל ההעדפות הקיימות
  - ערכים אמיתיים ורלוונטיים
  - לא נתוני דמה

#### **2.2 בדיקת תקינות מיגרציה**
- [ ] **וידוא שכל הנתונים הועברו**
- [ ] **בדיקת תקינות מבנה הנתונים**
- [ ] **מחיקת טבלאות ישנות**

#### **🔍 בדיקה + קריאה חוזרת לדוקומנטציה**
- [ ] **בדיקת נתונים מועברים** - וידוא שכל הנתונים הועברו נכון
- [ ] **קריאה חוזרת ב-`PREFERENCES_SYSTEM_COMPLETE.md`** - השוואה עם הדוקומנטציה
- [ ] **בדיקת פרופיל נימרוד** - וידוא שכל הערכים אמיתיים ורלוונטיים
- [ ] **בדיקת תקינות מבנה** - וידוא שהמבנה החדש עובד

---

### **שלב 3: Backend Services (Priority: High)**

#### **3.1 PreferencesService חדש**
- [ ] **יצירת `Backend/services/preferences_service.py`**
  - פונקציות נגישות לכל המערכת
  - Cache management
  - Error handling מפורט

#### **3.2 פונקציות נגישות**
- [ ] **`get_preference(user_id, preference_identifier, profile_id=None)`**
  - תמיכה בשם או מזהה העדפה
  - בחירה אוטומטית של פרופיל פעיל
  - Cache integration

- [ ] **`get_group_preferences(user_id, group_name, profile_id=None)`**
  - החזרת כל ההעדפות בקבוצה
  - Cache per group

- [ ] **`get_preferences_by_names(user_id, preference_names, profile_id=None)`**
  - קריאה מרובה יעילה
  - Batch processing

- [ ] **`get_all_user_preferences(user_id, profile_id=None)`**
  - החזרת כל ההעדפות של משתמש
  - Full cache support

#### **3.3 Cache System**
- [ ] **PreferencesCache class**
  - Per-user cache
  - TTL ארוך מאוד
  - Invalidation on save

- [ ] **Cache key structure**
  - `preferences:{user_id}:{profile_id}:{preference_name}`
  - `preferences:{user_id}:{profile_id}:group:{group_name}`

#### **3.4 Error Handling**
- [ ] **Custom Exception Classes**
  - `PreferenceNotFoundError`
  - `UserNotFoundError`
  - `ProfileNotFoundError`
  - `ValidationError`

- [ ] **הודעות שגיאה מפורטות**
  - בעברית
  - מידע על הבעיה המדויקת
  - הצעות לפתרון

#### **🔍 בדיקה + קריאה חוזרת לדוקומנטציה**
- [ ] **בדיקת פונקציות נגישות** - וידוא שכל הפונקציות עובדות
- [ ] **קריאה חוזרת ב-`OPTIMIZATION_GUIDE.md`** - השוואה עם הדוקומנטציה
- [ ] **בדיקת Cache System** - וידוא שהמטמון עובד נכון
- [ ] **בדיקת Error Handling** - וידוא שהודעות השגיאה ברורות

---

### **שלב 4: API Endpoints (Priority: High)**

#### **4.1 העדפות משתמש**
- [ ] **`GET /api/v1/preferences/user`**
  - החזרת העדפות + פרופילים
  - Cache integration
  - Error handling

- [ ] **`POST /api/v1/preferences/user`**
  - שמירת העדפות
  - Cache invalidation
  - Validation

#### **4.2 ניהול פרופילים**
- [ ] **`GET /api/v1/preferences/profiles`**
- [ ] **`POST /api/v1/preferences/profiles/create`**
- [ ] **`PUT /api/v1/preferences/profiles/{id}`**
- [ ] **`DELETE /api/v1/preferences/profiles/{id}`**

#### **4.3 ממשק ניהול (Admin)**
- [ ] **`GET /api/v1/preferences/admin/types`**
- [ ] **`GET /api/v1/preferences/admin/groups`**
- [ ] **`GET /api/v1/preferences/admin/search`**

#### **🔍 בדיקה + קריאה חוזרת לדוקומנטציה**
- [ ] **בדיקת API Endpoints** - וידוא שכל ה-endpoints עובדים
- [ ] **קריאה חוזרת ב-`API_REFERENCE.md`** - השוואה עם הדוקומנטציה
- [ ] **בדיקת Cache Integration** - וידוא שהמטמון עובד ב-API
- [ ] **בדיקת Error Handling** - וידוא שהודעות השגיאה מוחזרות נכון

---

### **שלב 5: Frontend JavaScript (Priority: Medium)**

#### **5.1 עדכון preferences.js**
- [ ] **התאמה למבנה החדש**
- [ ] **שימוש ב-API endpoints חדשים**
- [ ] **Cache integration**

#### **5.2 פונקציות נגישות Frontend**
- [ ] **`window.getPreference(preference_name)`**
- [ ] **`window.getGroupPreferences(group_name)`**
- [ ] **`window.getPreferencesByNames(preference_names)`**

#### **5.3 ממשק ניהול**
- [ ] **טבלה מלאה של סוגי העדפות**
- [ ] **חיפוש מתקדם**
- [ ] **עריכה ישירה**

#### **🔍 בדיקה + קריאה חוזרת לדוקומנטציה**
- [ ] **בדיקת Frontend Integration** - וידוא שהעמוד עובד עם המערכת החדשה
- [ ] **קריאה חוזרת ב-`PREFERENCES_SYSTEM_COMPLETE.md`** - השוואה עם הדוקומנטציה
- [ ] **בדיקת פונקציות נגישות** - וידוא שכל הפונקציות עובדות
- [ ] **בדיקת ממשק ניהול** - וידוא שהטבלה והחיפוש עובדים

---

### **שלב 6: Integration עם מערכת האילוצים (Priority: Medium)**

#### **6.1 Validation Integration**
- [ ] **שימוש ב-ValidationService הקיים**
- [ ] **אילוצים דינמיים מהטבלה**
- [ ] **הודעות שגיאה מותאמות**

#### **6.2 Constraint Management**
- [ ] **הוספת אילוצים לטבלאות החדשות**
- [ ] **מילוי enum_values**
- [ ] **בדיקת תקינות**

#### **🔍 בדיקה + קריאה חוזרת לדוקומנטציה**
- [ ] **בדיקת Validation Integration** - וידוא שהאילוצים עובדים
- [ ] **קריאה חוזרת ב-`VALIDATION_SYSTEM.md`** - השוואה עם הדוקומנטציה
- [ ] **בדיקת Constraint Management** - וידוא שכל האילוצים מוגדרים
- [ ] **בדיקת תקינות** - וידוא שהמערכת עובדת עם האילוצים

---

### **שלב 7: Testing ו-Validation (Priority: Medium)**

#### **7.1 Unit Tests**
- [ ] **בדיקת PreferencesService**
- [ ] **בדיקת Cache System**
- [ ] **בדיקת Error Handling**

#### **7.2 Integration Tests**
- [ ] **בדיקת API Endpoints**
- [ ] **בדיקת Frontend Integration**
- [ ] **בדיקת Performance**

#### **7.3 End-to-End Tests**
- [ ] **בדיקת זרימה מלאה**
- [ ] **בדיקת Migration**
- [ ] **בדיקת Cache Invalidation**

#### **🔍 בדיקה + קריאה חוזרת לדוקומנטציה**
- [ ] **בדיקת Unit Tests** - וידוא שכל הבדיקות עוברות
- [ ] **קריאה חוזרת ב-`PREFERENCES_SYSTEM_COMPLETE.md`** - השוואה עם הדוקומנטציה
- [ ] **בדיקת Integration Tests** - וידוא שהאינטגרציה עובדת
- [ ] **בדיקת End-to-End Tests** - וידוא שהזרימה המלאה עובדת

---

### **שלב 8: Documentation ו-Cleanup (Priority: Low)**

#### **8.1 Documentation**
- [ ] **עדכון דוקומנטציה כללית**
- [ ] **מדריך למפתחים**
- [ ] **דוגמאות שימוש**

#### **8.2 Code Cleanup**
- [ ] **מחיקת קוד ישן**
- [ ] **ניקוי קבצים לא נחוצים**
- [ ] **אופטימיזציה**

#### **🔍 בדיקה + קריאה חוזרת לדוקומנטציה**
- [ ] **בדיקת Documentation** - וידוא שכל הדוקומנטציה מעודכנת
- [ ] **קריאה חוזרת ב-`README.md`** - השוואה עם הדוקומנטציה
- [ ] **בדיקת Code Cleanup** - וידוא שהקוד נקי ומסודר
- [ ] **בדיקת אופטימיזציה** - וידוא שהמערכת מותאמת לביצועים

---

## 🔧 דרישות טכניות

### **Database Requirements**
- SQLite 3.35+ (למען INCLUDE clause)
- אינדקסים מותאמים לביצועים
- Constraints ו-foreign keys

### **Backend Requirements**
- Python 3.9+
- SQLAlchemy 1.4+
- Flask 2.0+
- Cache system (Redis או in-memory)

### **Frontend Requirements**
- JavaScript ES6+
- Fetch API support
- Local Storage support

### **Performance Requirements**
- זמן טעינה ראשונית: < 100ms
- זמן טעינה מ-cache: < 10ms
- זמן שמירה: < 200ms
- זיכרון cache: < 1MB per user

---

## 📊 Success Metrics

### **Functional Metrics**
- [ ] כל ההעדפות הקיימות עובדות
- [ ] פרופילים מרובים עובדים
- [ ] Cache invalidation עובד
- [ ] Error handling מפורט

### **Performance Metrics**
- [ ] Response time < 100ms
- [ ] Cache hit rate > 90%
- [ ] Memory usage < 1MB per user
- [ ] Database queries < 5 per request

### **User Experience Metrics**
- [ ] הודעות שגיאה ברורות
- [ ] ממשק ניהול עובד
- [ ] חיפוש העדפות עובד
- [ ] עריכה ישירה עובדת

---

## 🚨 Risks ו-Mitigation

### **High Risk**
- **Data Loss במהלך Migration**
  - *Mitigation*: גיבוי מלא לפני Migration
  - *Mitigation*: בדיקות מקיפות

- **Performance Issues**
  - *Mitigation*: אינדקסים מותאמים
  - *Mitigation*: Cache אגרסיבי

### **Medium Risk**
- **Cache Inconsistency**
  - *Mitigation*: Invalidation מוקפד
  - *Mitigation*: TTL מתאים

- **API Breaking Changes**
  - *Mitigation*: Backward compatibility
  - *Mitigation*: Gradual migration

---

## 📅 Timeline מוצע

### **Week 1: Database & Migration**
- יצירת טבלאות חדשות
- מיגרציה מנתונים קיימים
- אינדקסים ואופטימיזציה
- **🔍 בדיקה + קריאה חוזרת לדוקומנטציה**

### **Week 2: Backend Services**
- PreferencesService
- Cache System
- Error Handling
- **🔍 בדיקה + קריאה חוזרת לדוקומנטציה**

### **Week 3: API & Frontend**
- API Endpoints
- Frontend Integration
- Admin Interface
- **🔍 בדיקה + קריאה חוזרת לדוקומנטציה**

### **Week 4: Testing & Documentation**
- Unit Tests
- Integration Tests
- Documentation
- Cleanup
- **🔍 בדיקה + קריאה חוזרת לדוקומנטציה**

---

## 🎯 Definition of Done

### **Database**
- [ ] כל הטבלאות נוצרו
- [ ] נתונים הועברו בהצלחה
- [ ] אינדקסים עובדים
- [ ] Constraints מוגדרים
- [ ] **🔍 בדיקה + קריאה חוזרת לדוקומנטציה**

### **Backend**
- [ ] PreferencesService עובד
- [ ] Cache system עובד
- [ ] Error handling מפורט
- [ ] API endpoints עובדים
- [ ] **🔍 בדיקה + קריאה חוזרת לדוקומנטציה**

### **Frontend**
- [ ] JavaScript functions עובדות
- [ ] Admin interface עובד
- [ ] Integration עם עמוד העדפות
- [ ] Error messages ברורות
- [ ] **🔍 בדיקה + קריאה חוזרת לדוקומנטציה**

### **Testing**
- [ ] Unit tests עוברים
- [ ] Integration tests עוברים
- [ ] Performance tests עוברים
- [ ] End-to-end tests עוברים
- [ ] **🔍 בדיקה + קריאה חוזרת לדוקומנטציה**

### **Documentation**
- [ ] דוקומנטציה מעודכנת
- [ ] מדריך למפתחים
- [ ] דוגמאות שימוש
- [ ] API documentation
- [ ] **🔍 בדיקה + קריאה חוזרת לדוקומנטציה**

---

*עדכון אחרון: ינואר 2025 | גרסה 3.0*
