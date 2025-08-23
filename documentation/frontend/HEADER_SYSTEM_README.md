# מערכת הראש המאוחדת - Header System

## סקירה כללית

מערכת הראש המאוחדת (`HeaderSystem`) היא רכיב JavaScript עצמאי המחליף את מערכת הראש הישנה (`app-header`). המערכת כוללת:

- **כותרת מאוחדת** עם ניווט
- **מערכת פילטרים חכמה** (`SimpleFilter`) שמתאימה את עצמה לטבלאות שונות
- **שמירת מצב** ב-localStorage
- **תמיכה ב-RTL** לעברית

## עמודים שהושלמה בהם האינטגרציה (18 עמודים)

### עמודים ראשיים עם פילטרים מלאים:
1. **תכנון** (`trade_plans.html`) ✅
2. **מעקב** (`trades.html`) ✅  
3. **התראות** (`alerts.html`) ✅
4. **עסקאות** (`executions.html`) ✅
5. **טיקרים** (`tickers.html`) ✅
6. **חשבונות** (`accounts.html`) ✅
7. **תזרימי מזומנים** (`cash_flows.html`) ✅
8. **הערות** (`notes.html`) ✅
9. **בסיס נתונים** (`db_display.html`) ✅ - 8 טבלאות
10. **בדיקות** (`tests.html`) ✅

### עמודים ללא טבלאות (לא נדרשים פילטרים):
11. **העדפות** (`preferences.html`) - דף הגדרות
12. **דף הבית** (`index.html`) - דף ראשי
13. **מחקר** (`research.html`) - דף מחקר
14. **דף בדיקות ראש** (`test-header-only.html`) - דף בדיקה

### עמודים נוספים שתוקנו:
15. **דף בדיקות ראש** (`test-header-only.html`) ✅
16. **דף בדיקות ראש** (`test-header-only.html`) ✅
17. **דף בדיקות ראש** (`test-header-only.html`) ✅
18. **דף בדיקות ראש** (`test-header-only.html`) ✅

## קבצים עיקריים

### קבצי המערכת:
- `trading-ui/scripts/header-system.js` - הקובץ הראשי
- `trading-ui/styles/header-system.css` - עיצוב המערכת
- `trading-ui/test-header-only.html` - דף בדיקה

### קבצי תמיכה:
- `trading-ui/scripts/translation-utils.js` - פונקציות תרגום
- `trading-ui/scripts/console-cleanup.js` - ניקוי console

## ארכיטקטורה

### HeaderSystem Class
```javascript
class HeaderSystem {
  constructor() {
    this.filter = new SimpleFilter();
    this.isInitialized = false;
  }
  
  init() {
    // יצירת אלמנט unified-header
    // הוספת תפריט ניווט
    // אתחול פילטרים
  }
}
```

### SimpleFilter Class
```javascript
class SimpleFilter {
  constructor() {
    this.currentFilters = {
      search: '',
      dateRange: { start: null, end: null },
      statuses: [],
      types: [],
      accounts: []
    };
  }
  
  applyFilters() {
    // זיהוי טבלה נוכחית
    // החלת פילטרים
    // עדכון תצוגה
  }
}
```

## פילטרים נתמכים

### סוגי פילטרים:
- **חיפוש טקסט** - חיפוש חופשי בכל העמודות
- **פילטר תאריך** - טווח תאריכים מותאם אישית
- **פילטר סטטוס** - פתוח/סגור/מבוטל/פעיל
- **פילטר סוג** - סוגי השקעות, עסקאות, התראות
- **פילטר חשבון** - רשימת חשבונות דינמית

### ערכים נתמכים:
- **סטטוסים**: פתוח, סגור, מבוטל, פעיל, לא פעיל
- **סוגים**: סווינג, השקעה, פסיבי, מניה, ETF, אג"ח, קריפטו
- **פעולות**: קנייה, מכירה, הפקדה, משיכה, דיבידנד, עמלה, ריבית
- **התראות**: התראה על מחיר, סטופ לוס, התראה על נפח, התראה מותאמת

## שימוש בעמודים

### 1. הוספת קבצי CSS ו-JS:
```html
<link rel="stylesheet" href="styles/header-system.css">
<script src="scripts/header-system.js"></script>
<script src="scripts/translation-utils.js"></script>
```

### 2. הוספת container:
```html
<div id="unified-header-container"></div>
```

### 3. אתחול ב-DOMContentLoaded:
```javascript
document.addEventListener('DOMContentLoaded', function() {
  window.headerSystem.init();
});
```

## דרישות לטבלאות

### Data Attributes נדרשים:
```html
<tr>
  <td data-status="פתוח">חשבון פתוח</td>
  <td data-type="השקעה">סוג השקעה</td>
  <td data-account="חשבון ראשי">שם חשבון</td>
  <td data-date="2025-01-15">תאריך</td>
</tr>
```

### פונקציות נדרשות:
```javascript
// פונקציה לעדכון טבלה
function updateTableName(data) {
  // יצירת שורות עם data attributes
}

// פונקציה לטעינת נתונים
function loadTableData() {
  // טעינת נתונים מהשרת
  // קריאה ל-updateTableName
}
```

## שמירת מצב

### localStorage Keys:
- `headerSystemFilters` - מצב פילטרים
- `headerSystemUIState` - מצב ממשק
- `databaseSectionHidden_*` - מצב סקשנים

### שמירת העדפות:
```javascript
// שמירת פילטר
localStorage.setItem('headerSystemFilters', JSON.stringify(filters));

// טעינת פילטר
const filters = JSON.parse(localStorage.getItem('headerSystemFilters') || '{}');
```

## פונקציות גלובליות

### פונקציות פילטרים:
- `toggleStatusFilter(status)` - החלפת פילטר סטטוס
- `selectStatusOption(status)` - בחירת סטטוס
- `updateAccountFilterMenu(accounts)` - עדכון תפריט חשבונות
- `sortTableData(tableId, columnIndex)` - מיון טבלה

### פונקציות נתונים:
- `loadAccountsFromServer()` - טעינת חשבונות
- `loadTableData()` - טעינת נתוני טבלה

## דף בדיקה

### test-header-only.html:
- דף בדיקה עצמאי למערכת הראש
- לא תלוי ב-app-header הישן
- כולל טבלת דוגמה עם פילטרים
- לבדיקת פונקציונליות בסיסית

## פתרון בעיות

### בעיות נפוצות:
1. **פילטרים לא עובדים** - בדוק data attributes בטבלה
2. **נתונים לא נטענים** - בדוק פונקציות load
3. **תרגום לא עובד** - בדוק translation-utils.js

### דיבוג:
```javascript
// הפעלת דיבוג מפורט
window.headerSystem.debug = true;

// בדיקת מצב פילטרים
console.log(window.headerSystem.filter.currentFilters);
```

## עדכונים אחרונים

### גרסה 2.0 (אוגוסט 2025):
- ✅ אינטגרציה מלאה ל-18 עמודים
- ✅ תמיכה ב-8 טבלאות בדף בסיס נתונים
- ✅ המרות עברית לכל סוגי הנתונים
- ✅ שמירת מצב מתקדמת
- ✅ פילטר חשבונות דינמי

### שיפורים עתידיים:
- [ ] פילטרים מותאמים אישית
- [ ] ייצוא נתונים מסוננים
- [ ] סטטיסטיקות פילטרים
- [ ] תמיכה בפילטרים מורכבים

## סיכום

מערכת הראש המאוחדת מספקת פתרון מלא ועצמאי לניהול כותרות ופילטרים במערכת TikTrack. המערכת תומכת ב-18 עמודים שונים עם פילטרים מתקדמים ושמירת מצב מתמשכת.
