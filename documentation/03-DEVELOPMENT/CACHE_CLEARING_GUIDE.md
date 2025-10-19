# Cache Clearing Guide - מדריך ניקוי מטמון

**תאריך יצירה:** 15 אוקטובר 2025  
**גרסה:** 1.0  
**מטרה:** מדריך מפורט לשימוש במערכת ניקוי המטמון המשופרת

---

## 📋 תוכן עניינים

1. [הקדמה](#הקדמה)
2. [4 רמות ניקוי](#4-רמות-ניקוי)
3. [מתי להשתמש בכל רמה](#מתי-להשתמש-בכל-רמה)
4. [מערכת ולידציה](#מערכת-ולידציה)
5. [דוחות מפורטים](#דוחות-מפורטים)
6. [שימוש בממשק](#שימוש-בממשק)
7. [דוגמאות קוד](#דוגמאות-קוד)
8. [פתרון בעיות](#פתרון-בעיות)

---

## הקדמה

מערכת ניקוי המטמון המעודכנת כוללת **4 רמות ניקוי** עם **מערכת ולידציה מקיפה** ודוחות מפורטים. המערכת מיועדת לעזור למפתחים לנקות את המטמון בצורה מדויקת בהתאם לצורך.

### תכונות מרכזיות:
- ✅ **ניקוי דינמי** - זיהוי אוטומטי של כל Service Caches
- ✅ **ולידציה מקיפה** - בדיקה אוטומטית אחרי כל ניקוי
- ✅ **דוחות מפורטים** - מידע מלא על מה שנמחק
- ✅ **העתקה ללוח** - export של דוחות ל-debugging

---

## 4 רמות ניקוי

### 🟢 **Light (25% כיסוי)**

**מה מנקה:**
- Memory Layer - כל הנתונים הזמניים בזיכרון הדפדפן
- Service Caches - כל המטמון של שירותים חיצוניים

**מה לא נוגע:**
- localStorage
- IndexedDB
- מטמון שרת
- הגדרות משתמש

**זמן משוער:** < 100ms

---

### 🔵 **Medium (60% כיסוי)**

**מה מנקה:**
- כל מה שב-Light
- localStorage Layer - מפתחות `tiktrack_*` בלבד
- IndexedDB Layer - מסד נתונים מקומי
- Backend Layer - מטמון שרת

**מה לא נוגע:**
- Orphan Keys (הגדרות מחוץ למערכת המרכזית)

**זמן משוער:** < 500ms

---

### 🟠 **Full (100% כיסוי)**

**מה מנקה:**
- כל מה שב-Medium
- **Orphan Keys** - כל המפתחות מחוץ למערכת המרכזית:
  - **State:** `cashFlowsSectionState`, `executionsTopSectionCollapsed`
  - **Preferences:** `colorScheme`, `customColorScheme`, `headerFilters`, `consoleSettings`, `tikTrack_preferences`, `tt:preferences`
  - **Auth:** `authToken`, `currentUser`
  - **Testing:** `crud_test_results`, `linterLogs`, `css-duplicates-results`, `serverMonitorSettings`, `lastCRUDTestReport`
  - **Notifications:** `tiktrack_global_notifications_history`, `tiktrack_global_notifications_stats`
  - **App:** `appStatus`, `cache_mode`, `lastExternalDataRefresh`
  - **Dynamic patterns:** `sortState_*`, `section-visibility-*`, `top-section-collapsed-*`, `accounts_ui_state_*`

**זמן משוער:** < 1000ms

---

### ☢️ **Nuclear (150%+ כיסוי)**

**מה מנקה:**
- כל מה שב-Full
- **ALL localStorage** - כולל נתונים לא של TikTrack
- **Complete IndexedDB** - מחיקת כל המסד
- **sessionStorage** - כל נתוני הפעלה

**⚠️ אזהרה:** דורש רענון מלא של הדף והתחברות מחדש!

**זמן משוער:** < 2000ms

---

## מתי להשתמש בכל רמה

### 🟢 **Light - ניקוי קל**
```
✅ שינויים בקבצי JS/CSS
✅ תיקוני bugs בלוגיקה  
✅ עדכוני UI קטנים
✅ בדיקות מהירות
```

**שימוש:** כפתור בתפריט הראשי, או בדיקות מהירות בפיתוח.

---

### 🔵 **Medium - ניקוי בינוני**
```
✅ שינויי נתונים מהשרת
✅ עדכוני API responses
✅ שינויי מבנה נתונים
✅ ניקוי יומי/שבועי
```

**שימוש:** ברירת מחדל, ניקוי רציונלי של רוב הבעיות.

---

### 🟠 **Full - ניקוי מלא**
```
✅ שינויי הגדרות משתמש
✅ עדכוני מערכת אימות
✅ שינויי העדפות
✅ בעיות חמורות במערכת
```

**שימוש:** כפתור בתפריט הראשי (כפי שהוגדר), לפני גרסאות חדשות.

---

### ☢️ **Nuclear - ניקוי גרעיני**
```
✅ איפוס מוחלט לפני גרסה חדשה
✅ שינויי תשתית מערכת
✅ בעיות critical שמשפיעות על כל המערכת
✅ איפוס מצב corrupt של מטמון
```

**שימוש:** חירום בלבד, אחרי אישור מפיק.

---

## מערכת ולידציה

המערכת כוללת ולידציה אוטומטית שאפשר להפעיל עם `validateAfter: true`.

### מה הולידציה בודקת:

#### **לכל הרמות:**
- ✅ Memory Layer נוקה לחלוטין
- ✅ Service Caches נוקו

#### **Medium ומעלה:**
- ✅ localStorage keys עם prefix `tiktrack_*` נוקו
- ✅ IndexedDB entries נוקו
- ✅ Backend cache נוקה

#### **Full ומעלה:**
- ✅ Orphan Keys נוקו לפי קטגוריות
- ✅ Dynamic pattern keys נוקו

#### **Nuclear בלבד:**
- ✅ כמעט כל localStorage נוקה (מאפשר מפתחות דפדפן)

### תוצאות ולידציה:
```javascript
{
  success: true/false,
  before: { /* סטטיסטיקות לפני */ },
  after: { /* סטטיסטיקות אחרי */ },
  remainingKeys: [], // מפתחות שנשארו
  issues: [], // בעיות שזוהו
  level: 'medium'
}
```

---

## דוחות מפורטים

### מבנה הדוח:
```javascript
{
  timestamp: "2025-10-15T12:00:00.000Z",
  level: "medium",
  duration: 234,
  clearedItems: {
    memoryLayer: 15,
    serviceCaches: 6,
    localStorageLayer: 32,
    indexedDBLayer: 8,
    backendLayer: "Success",
    orphanKeys: 0,
    allLocalStorage: 0
  },
  before: { /* UnifiedCacheManager stats */ },
  coverage: "60%",
  validation: { /* תוצאות ולידציה */ }
}
```

### העתקה ללוח:
```javascript
// זמין גלובלית
window.copyCacheReportToClipboard(report);
```

---

## שימוש בממשק

### בעמוד ניהול המטמון (`/system-management`):

1. **בחר רמת ניקוי:** Light/Medium/Full/Nuclear
2. **הפעל ולידציה** (אופציונלי): סמן את ה-checkbox
3. **לחץ על כפתור** - התהליך יתחיל
4. **קבל דוח** - הודעה מפורטת עם תוצאות

### בתפריט הראשי (כפתור 🧹):
- **ברירת מחדל:** Full level
- **ללא ולידציה** (מהיר)

---

## דוגמאות קוד

### ניקוי פשוט:
```javascript
// ניקוי מהיר ללא ולידציה
await clearAllCache({ level: 'medium' });
```

### ניקוי עם ולידציה:
```javascript
// ניקוי עם בדיקה מקיפה
const results = await clearAllCache({ 
  level: 'full', 
  validateAfter: true 
});

console.log('ניקוי הושלם:', results.validation.success);
```

### ניקוי בפיתוח:
```javascript
// ניקוי מהיר בפיתוח
await clearAllCache({ 
  level: 'light',
  skipConfirmation: true,
  verbose: false
});
```

### העתקת דוח ללוח:
```javascript
// אחרי ניקוי עם ולידציה
const results = await clearAllCache({ 
  level: 'medium', 
  validateAfter: true 
});

// העתקה ללוח לצרכי debugging
await copyCacheReportToClipboard(results.detailedReport);
```

---

## פתרון בעיות

### בעיה: ניקוי לא עובד
**פתרון:** בדוק שהמערכת מאותחלת
```javascript
if (!window.UnifiedCacheManager?.initialized) {
  console.error('UnifiedCacheManager not initialized');
}
```

### בעיה: ולידציה נכשלת
**פתרון:** בדוק דוח ולידציה
```javascript
if (results.validation && !results.validation.success) {
  console.log('בעיות:', results.validation.issues);
  console.log('מפתחות שנותרו:', results.validation.remainingKeys);
}
```

### בעיה: Nuclear לא מנקה הכל
**פתרון:** זה תקין - Nuclear מתיר מפתחות דפדפן בסיסיים
```javascript
// בדיקה ידנית של localStorage
console.log('מפתחות שנותרו:', Object.keys(localStorage));
```

### בעיה: דוח לא מועתק ללוח
**פתרון:** בדוק הרשאות דפדפן
```javascript
try {
  await navigator.clipboard.writeText(text);
} catch (error) {
  console.error('בעיה בהעתקה:', error);
}
```

---

## המלצות

### למפתחים:
1. **השתמשו ב-Light** לשינויים תכופים
2. **הפעילו ולידציה** בפיתוח פעיל
3. **שמרו דוחות** לבעיות מורכבות

### לייצור:
1. **Medium** לרוב הבעיות
2. **Full** רק עם אישור מפיק
3. **Nuclear** חירום בלבד

### בדיקות:
1. תמיד בחנו את דוח הולידציה
2. שמרו העתקות דוחות ל-debugging
3. בדקו זמני ביצוע לפי הציפיות

---

**עודכן לאחרונה:** 15 אוקטובר 2025  
**גרסה:** 1.0 - Enhanced Cache Clearing System

