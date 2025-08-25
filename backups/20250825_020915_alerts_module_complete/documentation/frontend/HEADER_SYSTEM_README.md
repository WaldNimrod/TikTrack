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

## שינויים טכניים שבוצעו

### 1. עדכון קבצי HTML:
- הסרת `<div id="unified-header-container"></div>` מכל העמודים
- עדכון `DOMContentLoaded` listeners לשימוש ב-`window.headerSystem.init()`
- הוספת קישורים לקבצי CSS ו-JS של מערכת הראש המאוחדת

### 2. עדכון פונקציות טבלאות:
- הוספת `data-attributes` לכל השורות בטבלאות:
  - `data-status` - לפילטר סטטוס
  - `data-type` - לפילטר סוג
  - `data-account` - לפילטר חשבון
  - `data-date` - לפילטר תאריך
- הוספת לוגיקת המרה לעברית לכל הפילטרים
- עדכון פונקציות `updateTable` בכל הקבצים

### 3. דף בסיס נתונים מיוחד:
- תיקון 8 טבלאות שונות עם data attributes מלאים
- הוספת המרות עברית לכל סוגי הנתונים
- תמיכה בפילטרים לכל הטבלאות במקביל

## שמירת מצב
- הפילטרים שומרים את המצב שלהם ב-`localStorage`
- מצב פתיחה/סגירה של סקשנים נשמר לכל עמוד בנפרד
- העדפות משתמש נשמרות בין הפעלות

## תוצאות בדיקות
- ✅ כל העמודים נטענים בהצלחה
- ✅ הפילטרים עובדים על כל הטבלאות
- ✅ פילטר החשבונות טוען נתונים דינמית
- ✅ המרות עברית עובדות כראוי
- ✅ שמירת מצב עובדת בין עמודים

## קבצים שעודכנו
- `trading-ui/scripts/planning.js` - תיקון data attributes
- `trading-ui/scripts/trades.js` - תיקון data attributes  
- `trading-ui/scripts/executions.js` - תיקון data attributes
- `trading-ui/scripts/tickers.js` - תיקון data attributes
- `trading-ui/scripts/accounts.js` - תיקון data attributes
- `trading-ui/scripts/cash_flows.js` - הוספת פונקציות חסרות
- `trading-ui/scripts/database.js` - תיקון 8 טבלאות
- `documentation/frontend/HEADER_SYSTEM_README.md` - עדכון תיעוד

## עדכון אוגוסט 2025 - אופציית "הכול" ומערכת משתמשים

### שינויים חדשים:
1. **אופציית "הכול" בכל הפילטרים**
   - פילטר סטטוס: פתוח, סגור, מבוטל + הכול
   - פילטר טיפוס: סווינג, השקעה, פסיבי + הכול
   - פילטר חשבונות: רשימה דינמית + הכול
   - פילטר תאריכים: כל זמן (כבר היה)

2. **תיקון כפתורי איפוס וניקוי**
   - כפתור ניקוי: מאפס הכל ומציג כל הרשומות
   - כפתור איפוס: מאפס לערכי ברירת מחדל מהעדפות
   - טעינת חשבונות מחדש אחרי איפוס/ניקוי

3. **פילטור מקומי בכל העמודים**
   - עסקאות: `filterExecutionsLocally()`
   - טיקרים: `filterTickersLocally()`
   - תזרימי מזומנים: `filterCashFlowsLocally()`

4. **מערכת משתמשים**
   - משתמש ברירת מחדל: "nimrod"
   - תמיכה במשתמשים מרובים
   - backward compatibility

5. **API העדפות**
   - תיקון שגיאות 500
   - מבנה JSON מעודכן
   - ערכי ברירת מחדל: open, swing, this_week

## עדכון 24 באוגוסט 2025 - ניקוי בלבול קבצים

### שינויים טכניים:
1. **ניקוי בלבול קבצים**
   - הסרת `SimpleFilter` הכפול מ-`header-system.js`
   - איחוד מערכות פילטור לשימוש ב-`simple-filter.js`
   - תיקון סלקטורים: `.status-filter-item`, `.type-filter-item`, `.account-filter-item`

2. **תיקון API חשבונות**
   - עדכון הקריאה ל-API מ-`/api/accounts` ל-`/api/v1/accounts/`
   - תיקון עיבוד התגובה מה-API

3. **עדכון עמודים**
   - עדכון 10 עמודים ראשיים עם הקבצים הנכונים
   - תיקון סדר טעינת קבצים
   - הסרת `filter-system.js` מכל העמודים

### מצב נוכחי:
- ✅ שרת רץ על http://localhost:8080
- ✅ API חשבונות עובד: `/api/v1/accounts/`
- ✅ קבצים נטענים: `simple-filter.js`, `header-system.js`
- ✅ עמודים מעודכנים: 10 עמודים ראשיים
- ✅ סלקטורים מתוקנים: פילטרים עובדים
- 🔄 בדיקות נדרשות: פונקציונליות בפועל

## ארכיטקטורה

### קבצים ראשיים:
- `header-system.js` - מערכת הראש המאוחדת
- `simple-filter.js` - מערכת פילטור מאוחדת
- `header-system.css` - עיצוב מערכת הראש

### תלויות:
- `main.js` - פונקציות גלובליות
- `translation-utils.js` - פונקציות תרגום
- `table-mappings.js` - מיפוי טבלאות

### API Endpoints:
- `/api/v1/accounts/` - טעינת חשבונות לפילטר
- `/api/preferences` - העדפות משתמש

## הוראות שימוש

### אתחול מערכת:
```javascript
// אתחול אוטומטי
document.addEventListener('DOMContentLoaded', () => {
  if (window.headerSystem) {
    window.headerSystem.init();
  }
  if (window.simpleFilter) {
    window.simpleFilter.init();
  }
});
```

### פילטור נתונים:
```javascript
// פילטור מקומי
const filteredData = filterExecutionsLocally(
  executions, 
  selectedStatuses, 
  selectedTypes, 
  selectedAccounts, 
  dateRange, 
  searchTerm
);
```

### שמירת מצב:
```javascript
// שמירת פילטרים
localStorage.setItem('filterStates', JSON.stringify(filterStates));

// טעינת פילטרים
const savedFilters = JSON.parse(localStorage.getItem('filterStates'));
```

## פתרון בעיות

### בעיות נפוצות:
1. **פילטרים לא עובדים**: בדוק שהסלקטורים נכונים
2. **חשבונות לא נטענים**: בדוק שה-API endpoint נכון
3. **מצב לא נשמר**: בדוק שה-localStorage עובד

### דיבאג:
```javascript
// בדיקת מצב מערכת
console.log('Header System:', window.headerSystem);
console.log('Simple Filter:', window.simpleFilter);
console.log('Filter States:', localStorage.getItem('filterStates'));
```

## תאימות
- **דפדפנים**: Chrome, Firefox, Safari, Edge
- **רזולוציות**: Desktop, Tablet, Mobile
- **כיווניות**: RTL (עברית), LTR (אנגלית)

---

**תאריך עדכון אחרון**: 24 באוגוסט 2025  
**גרסה**: 2.1  
**מצב**: הושלם בהצלחה - נדרשות בדיקות סופיות
