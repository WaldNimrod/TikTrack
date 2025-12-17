# תוכנית תיקון בעיות שאינן קשורות לבנדלים

**תאריך:** 12 בדצמבר 2025  
**מבוסס על:** `development_testing_report.md`

## סיכום בעיות שזוהו

### 1. שגיאות Syntax (קריטי) - לבדיקה מחדש
- `Illegal break statement` ב-`auth-guard.js:160` - **לא נמצא בקוד הנוכחי** (ייתכן שתוקן או קשור לבנדלים)
- `loadAn` reference error ב-`trading-journal-page.js:2123` - **לא נמצא בקוד הנוכחי** (ייתכן שתוקן או קשור לבנדלים)
- `Identifier` error ב-`related-object-filters.js:0` - **לא נמצא בקוד הנוכחי** (ייתכן שתוקן או קשור לבנדלים)

**סטטוס:** הקוד הנוכחי נראה תקין. צריך לבדוק אם הבעיות קיימות בבנדלים או אם כבר תוקנו.

### 2. בעיות איתחול (בינוני)

#### 2.1 Unified Cache Manager not initialized
**תיאור:** UnifiedCacheManager לא מאותחל לפני שימוש  
**מיקום:** מופיע ב-`base.bundle.js:1920` (רק עם בנדלים)  
**השפעה:** מטמון לא זמין, גישה לנתונים נכשלת

**סטטוס:** יש בדיקות איתחול ב-`core-systems.js`, אבל צריך לוודא שכל המקומות בודקים לפני שימוש.

#### 2.2 ModalManagerV2.showModal is not a function
**תיאור:** ModalManagerV2 לא זמין לפני קריאה ל-showModal  
**מיקום:** מופיע ב-`modules.bundle.js:4767` (רק עם בנדלים)  
**השפעה:** חלונות מודל לא עובדים

**סטטוס:** יש `showModalSafe` helper, אבל צריך לוודא שכל המקומות משתמשים בו.

### 3. בעיות API (בינוני)

#### 3.1 API preferences לא מגיב (500 Internal Server Error)
**Endpoint:** `/api/preferences/types`  
**סיבה דווחה:** `name 'preferences' is not defined` בשרת  
**השפעה:** מערכת העדפות לא זמינה  
**סטטוס:** מתאושש לאחר חימום שרת

**סטטוס:** הקוד נראה תקין - `preferences_service` מוגדר כ-singleton. צריך לבדוק אם יש בעיה ב-import או באיתחול.

## תוכנית תיקון

### שלב 1: בדיקה מחדש של שגיאות Syntax
1. להריץ בדיקות Selenium על development (ללא בנדלים)
2. לבדוק אם השגיאות עדיין קיימות
3. אם כן - לתקן, אם לא - לסמן כטופל

### שלב 2: שיפור בדיקות איתחול
1. להוסיף בדיקות איתחול לפני כל שימוש ב-UnifiedCacheManager
2. להוסיף בדיקות איתחול לפני כל שימוש ב-ModalManagerV2
3. להוסיף error handling טוב יותר

### שלב 3: תיקון Preferences API
1. לבדוק את import של preferences_service
2. לבדוק את איתחול השרת
3. להוסיף error handling טוב יותר

### שלב 4: בדיקה מחדש
1. להריץ בדיקות Selenium מחדש
2. לוודא שכל הבעיות תוקנו
3. לתעד את התיקונים

## קבצים לבדיקה

### Frontend
- `trading-ui/scripts/auth-guard.js` - לבדוק שגיאות Syntax
- `trading-ui/scripts/trading-journal-page.js` - לבדוק שגיאת loadAn
- `trading-ui/scripts/related-object-filters.js` - לבדוק שגיאת Identifier
- `trading-ui/scripts/unified-cache-manager.js` - לבדוק איתחול
- `trading-ui/scripts/modal-manager-v2.js` - לבדוק איתחול

### Backend
- `Backend/routes/api/preferences.py` - לבדוק import של preferences_service
- `Backend/services/preferences_service.py` - לבדוק הגדרת singleton

## הערות
- כל הבעיות שדווחו קשורות לבנדלים או כבר תוקנו
- צריך לבדוק מחדש עם בדיקות Selenium
- אם הבעיות לא קיימות - לסמן כטופל
