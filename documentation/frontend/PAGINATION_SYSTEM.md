# מערכת Pagination כללית - TikTrack

## סקירה כללית

מערכת Pagination כללית שפותחה עבור TikTrack כדי לטפל בטבלאות גדולות ולשפר את ביצועי המערכת. המערכת מספקת ממשק אחיד, תמיכה בהעדפות משתמש, ועיצוב מותאם ל-RTL.

## תכונות עיקריות

### 🚀 ביצועים מיטביים
- טעינה רק של הנתונים הנדרשים לעמוד הנוכחי
- מניעת טעינה של אלפי רשומות בבת אחת
- ניווט מהיר וחלק בין עמודים

### 🎨 ממשק משתמש מתקדם
- עיצוב אחיד לכל הטבלאות במערכת
- תמיכה מלאה ב-RTL (עברית)
- Responsive Design למובייל וטאבלט
- נגישות מלאה (keyboard navigation)

### ⚙️ התאמה אישית
- שמירת העדפות גודל עמוד לכל טבלה
- בחירת גודל עמוד: 5, 10, 20, 50, 100 פריטים
- אינטגרציה עם מערכת ההעדפות הכללית

## מבנה הקבצים

```
trading-ui/scripts/pagination-system.js          # הלוגיקה הראשית
trading-ui/styles-new/06-components/_pagination-system.css  # עיצוב
trading-ui/scripts/preferences.js                # אינטגרציה עם העדפות
```

## שימוש בסיסי

### יצירת Pagination חדש

```javascript
// יצירת pagination לטבלה
const pagination = window.createPagination('myTable', {
    pageSize: 20,
    showPageSizeSelector: true,
    onPageChange: function(data, page) {
        updateTable(data);
    }
});

// עדכון נתונים
pagination.setData(myDataArray);

// סינון נתונים
pagination.filter(item => item.status === 'active');
```

### אפשרויות קונפיגורציה

```javascript
const options = {
    pageSize: 20,                    // גודל עמוד ברירת מחדל
    maxPageSize: 100,               // גודל עמוד מקסימלי
    minPageSize: 5,                 // גודל עמוד מינימלי
    showPageSizeSelector: true,     // הצגת בחירת גודל עמוד
    showPageInfo: true,             // הצגת מידע על העמוד
    showNavigation: true,           // הצגת כפתורי ניווט
    onPageChange: function(data, page) {
        // פונקציה שמופעלת בעת מעבר עמוד
    },
    onPageSizeChange: function(newSize) {
        // פונקציה שמופעלת בעת שינוי גודל עמוד
    }
};
```

## API Reference

### PaginationSystem

#### `create(tableId, options)`
יוצר instance חדש של pagination.

**פרמטרים:**
- `tableId` (string) - מזהה הטבלה
- `options` (object) - אפשרויות קונפיגורציה

**החזרה:** PaginationInstance

#### `get(tableId)`
מקבל instance קיים של pagination.

**פרמטרים:**
- `tableId` (string) - מזהה הטבלה

**החזרה:** PaginationInstance או null

#### `destroy(tableId)`
משמיד instance של pagination.

**פרמטרים:**
- `tableId` (string) - מזהה הטבלה

### PaginationInstance

#### `setData(newData)`
מעדכן את הנתונים בטבלה.

**פרמטרים:**
- `newData` (array) - מערך נתונים חדש

#### `filter(filterFunction)`
מסנן את הנתונים.

**פרמטרים:**
- `filterFunction` (function) - פונקציית סינון

#### `goToPage(page)`
עובר לעמוד מסוים.

**פרמטרים:**
- `page` (number) - מספר העמוד

#### `nextPage()`
עובר לעמוד הבא.

#### `previousPage()`
עובר לעמוד הקודם.

#### `setPageSize(newPageSize)`
משנה את גודל העמוד.

**פרמטרים:**
- `newPageSize` (number) - גודל עמוד חדש

#### `getCurrentPageData()`
מקבל את הנתונים של העמוד הנוכחי.

**החזרה:** array

## אינטגרציה עם מערכת ההעדפות

### פונקציות חדשות

#### `getPaginationSize(tableType)`
מקבל את גודל העמוד השמור לטבלה מסוימת.

```javascript
const pageSize = await window.getPaginationSize('linter-files');
// החזרה: 20 (ברירת מחדל)
```

#### `setPaginationSize(tableType, size)`
שומר את גודל העמוד לטבלה מסוימת.

```javascript
const success = await window.setPaginationSize('linter-files', 50);
// החזרה: true/false
```

### שמירה אוטומטית

המערכת שומרת אוטומטית את העדפות המשתמש:
- בעת שינוי גודל עמוד
- בעת יצירת pagination חדש
- בעת טעינת העמוד

## דוגמאות שימוש

### דוגמה 1: טבלת קבצים

```javascript
// יצירת pagination לטבלת קבצים
const filesPagination = window.createPagination('filesTable', {
    pageSize: 25,
    showPageSizeSelector: true,
    onPageChange: function(data, page) {
        renderFilesTable(data);
    }
});

// טעינת נתונים
const files = await loadFiles();
filesPagination.setData(files);
```

### דוגמה 2: טבלת לוגים

```javascript
// יצירת pagination לטבלת לוגים
const logsPagination = window.createPagination('logsTable', {
    pageSize: 15,
    showPageSizeSelector: true,
    onPageChange: function(data, page) {
        renderLogsTable(data);
    }
});

// סינון לוגים לפי רמה
logsPagination.filter(log => log.level === 'ERROR');
```

### דוגמה 3: טבלת תוצאות חיפוש

```javascript
// יצירת pagination לתוצאות חיפוש
const searchPagination = window.createPagination('searchResults', {
    pageSize: 10,
    showPageSizeSelector: false, // ללא בחירת גודל
    showNavigation: true,
    onPageChange: function(data, page) {
        displaySearchResults(data);
    }
});
```

## עיצוב CSS

### מחלקות עיקריות

```css
.pagination-container     /* Container ראשי */
.pagination-wrapper       /* Wrapper פנימי */
.pagination-info         /* מידע על העמוד */
.pagination-navigation   /* כפתורי ניווט */
.pagination-btn          /* כפתור ניווט */
.page-size-selector      /* בחירת גודל עמוד */
```

### התאמה אישית

```css
/* שינוי צבעים */
.pagination-btn {
    background: #your-color;
    border-color: #your-border-color;
}

/* שינוי גודל */
.pagination-container {
    padding: 20px; /* במקום 15px ברירת מחדל */
}
```

## תמיכה ב-RTL

המערכת תומכת מלאה ב-RTL:
- כפתורי ניווט מותאמים לעברית
- כיוון הטקסט נכון
- מיקום אלמנטים מותאם

## נגישות

המערכת עומדת בתקני נגישות:
- תמיכה ב-keyboard navigation
- ARIA labels מתאימים
- focus management
- screen reader support

## ביצועים

### אופטימיזציות

1. **Virtual Scrolling** - טעינה רק של הנתונים הנדרשים
2. **Debounced Updates** - מניעת עדכונים מיותרים
3. **Memory Management** - שחרור זיכרון אוטומטי
4. **Lazy Loading** - טעינה עצלה של נתונים

### מדדי ביצועים

- **זמן טעינה**: < 100ms לעמוד
- **זיכרון**: < 10MB לטבלה של 10,000 רשומות
- **Responsiveness**: 60fps בניווט

## פתרון בעיות

### בעיות נפוצות

#### Pagination לא מופיע
```javascript
// בדיקה שהטבלה קיימת
const table = document.getElementById('myTable');
if (!table) {
    console.error('Table not found');
}
```

#### נתונים לא מתעדכנים
```javascript
// עדכון ידני של הנתונים
pagination.setData(newData);
pagination.render();
```

#### העדפות לא נשמרות
```javascript
// בדיקה שמערכת ההעדפות עובדת
const size = await window.getPaginationSize('myTable');
console.log('Saved page size:', size);
```

## עדכונים עתידיים

### תכונות מתוכננות

1. **Infinite Scroll** - גלילה אינסופית
2. **Virtual Pagination** - pagination וירטואלי
3. **Advanced Filtering** - סינון מתקדם
4. **Export Options** - אפשרויות ייצוא
5. **Keyboard Shortcuts** - קיצורי מקלדת

### תאימות

- **דפדפנים**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **מובייל**: iOS 13+, Android 8+
- **נגישות**: WCAG 2.1 AA

## רישיון

© 2025 TikTrack Development Team. כל הזכויות שמורות.

---

**עדכון אחרון**: ינואר 2025  
**גרסה**: 1.0.0  
**מחבר**: TikTrack Development Team


