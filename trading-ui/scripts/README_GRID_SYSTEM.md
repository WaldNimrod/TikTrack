# מערכת הטבלאות המודולרית - TikTrack

## סקירה כללית

מערכת הטבלאות המודולרית מאפשרת שימוש אחיד בטבלאות בכל הדפים במערכת. המערכת כוללת תבנית טבלה כללית שניתן לשיכפול בקלות ומבטיחה עיצוב אחיד בכל האתר. המערכת מחולקת לקבצים נפרדים לפי תפקידים:

### קבצי המערכת

1. **`grid-table.js`** - לוגיקת הטבלאות הבסיסית (סידור, סגירה/פתיחה)
2. **`grid-table.css`** - סגנונות הטבלאות
3. **`table-template.html`** - תבנית טבלה לשיכפול
4. **`designs.html`** - דוגמה לשימוש בתבנית

## איך להשתמש במערכת

### תבנית טבלה לשיכפול

המערכת כוללת תבנית טבלה כללית שניתן לשיכפול בקלות:

1. **העתקת התבנית** - השתמש בקובץ `table-template.html` כבסיס
2. **התאמת הכותרת** - שנה את הכותרת והעמודות לפי הצורך
3. **הוספת פונקציות** - הוסף את הפונקציות JavaScript הנדרשות
4. **קישור קבצים** - וודא שקבצי CSS ו-JavaScript מקושרים

#### דוגמה לשימוש:
```html
<!-- אזור טבלה -->
<div class="content-section">
  <!-- כותרת הטבלה -->
  <div class="table-header">
    <div class="table-title">📋 כותרת הטבלה</div>
    <div class="table-count">0 פריטים</div>
    <div class="table-actions">
      <button class="refresh-btn" onclick="addNewItem()">
        <span class="action-icon">➕</span> הוסף
      </button>
      <button class="refresh-btn" onclick="refreshTable()">
        <span class="action-icon">🔄</span> רענן
      </button>
      <div class="action-separator"></div>
      <button class="filter-toggle-btn" onclick="toggleTableSection()">
        <span class="filter-icon">▲</span>
      </button>
    </div>
  </div>
  
  <!-- תוכן הטבלה -->
  <div class="content-section">
    <div class="table-responsive">
      <table class="table">
        <!-- תוכן הטבלה -->
      </table>
    </div>
  </div>
</div>
```

### קלאסים זמינים

#### כותרת הטבלה:
- `.table-header` - כותרת הטבלה
- `.table-title` - כותרת ראשית
- `.table-count` - מונה פריטים
- `.table-actions` - אזור כפתורי פעולה

#### כפתורים:
- `.refresh-btn` - כפתורי רענון והוספה
- `.filter-toggle-btn` - כפתור סגירה/פתיחה
- `.action-icon` - אייקונים בכפתורים
- `.action-separator` - מפריד בין כפתורים

#### טבלה:
- `.sortable-header` - כותרות עם סידור
- `.header-subtitle` - כותרות משנה
- `.actions-header` - כותרת עמודת פעולות
- `.actions-cell` - תא פעולות
- `.ticker-link` - קישורים בטבלה

#### סטטוס:
- `.status-badge` - תגי סטטוס
- `.status-open` - סטטוס פתוח
- `.status-canceled` - סטטוס מבוטל
- `.status-closed` - סטטוס סגור

### יתרונות המערכת החדשה

1. **מודולריות** - כל הטבלאות משתמשות באותם קלאסים
2. **עקביות** - עיצוב אחיד בכל האתר
3. **תחזוקה קלה** - שינוי אחד ב-CSS משפיע על הכל
4. **שיכפול מהיר** - העתקה והתאמה בלבד
5. **נקיות** - ללא ID-ים או סגנונות פנימיים
6. **ביצועים** - טעינה מהירה ללא ספריות חיצוניות

### אלמנטים אוניברסליים vs אלמנטים ספציפיים

**אלמנטים אוניברסליים** (נוצרים אוטומטית):
- סגנונות הטבלה
- פונקציונליות סידור
- כפתורי פעולה
- אנימציות

**אלמנטים ספציפיים** (צריכים להיות בדף):
- תוכן הטבלה
- פונקציות JavaScript מותאמות
- נתונים ספציפיים

### מניעת כפילות

המערכת כוללת מנגנונים למניעת כפילות:
- **גריד יחיד** - רק גריד אחד יכול להיות פעיל בכל רגע נתון
- **Event Listeners יחידים** - כל אלמנט מקבל event listener רק פעם אחת
- **אתחול חד פעמי** - הפונקציות בודקות אם המערכת כבר מאותחלת

### 1. הוספת קבצי הסקריפט לדף

```html
<!-- Table System Scripts -->
<script src="scripts/grid-table.js"></script>
```

### 2. הוספת קובץ הסגנונות

```html
<link rel="stylesheet" href="styles/grid-table.css" />
```

### 3. שימוש בתבנית הטבלה

```html
<!-- העתק את התבנית מ-table-template.html -->
<div class="content-section">
  <div class="table-header">
    <!-- כותרת הטבלה -->
  </div>
  <div class="content-section">
    <div class="table-responsive">
      <table class="table">
        <!-- תוכן הטבלה -->
      </table>
    </div>
  </div>
</div>
```

### 4. אתחול המערכת

#### אתחול בסיסי
```javascript
// אתחול אוטומטי - המערכת תזהה את אלמנט הגריד ותאתחל אותו
document.addEventListener('DOMContentLoaded', () => {
  // המערכת תאתחל אוטומטית
});
```

#### אתחול מותאם אישית
```javascript
// אתחול עם הגדרות מותאמות אישית
initializeGridSystem('#agGridFloating', {
  // הגדרות מותאמות אישית
  defaultColDef: {
    sortable: true,
    filter: true
  }
});
```

#### אתחול עם פילטרים
```javascript
// אתחול עם פילטרים מותאמים אישית
initializeGridWithFilters('#agGridFloating', {
  statuses: ['פתוח', 'סגור'],
  types: ['סווינג', 'השקעה']
});
```

## פונקציות עיקריות

### ניהול טבלאות

- `initializeTableSorting(tableId)` - אתחול סידור לטבלה
- `sortTable(table, columnIndex, sortDirection)` - סידור טבלה
- `updateSortIcons(table, sortedColumn, sortDirection)` - עדכון אייקוני סידור

### ניהול סקשנים

- `togglePlansSection()` - סגירה/פתיחה של אזור תכנונים
- `toggleAlertsSection()` - סגירה/פתיחה של אזור התראות
- `toggleTopSection()` - סגירה/פתיחה של החלק העליון
- `restoreAllSectionStates()` - שחזור כל מצבי הסקשנים

### פונקציות מותאמות אישית

יש ליצור פונקציות מותאמות לכל טבלה:
- `addNewItem()` - הוספת פריט חדש
- `refreshTable()` - רענון הטבלה
- `openItemDetails(id)` - פתיחת פרטי פריט
- `editItem(id)` - עריכת פריט
- `deleteItem(id)` - מחיקת פריט

- `applyStatusFilterToGrid(selectedStatuses)` - החלת פילטר סטטוס
- `updateGridFromComponent(selectedStatuses)` - עדכון גריד מקומפוננטה
- `loadSavedFilters()` - טעינת פילטרים שמורים
- `clearTestFilter()` - ניקוי פילטר בדיקה

### ניהול נתונים

- `loadPlansFromServer()` - טעינת נתונים מהשרת
- `updateSummaryStats(data)` - עדכון סטטיסטיקות
- `createSampleData(count)` - יצירת נתוני דוגמה
- `refreshData()` - רענון נתונים

### אתחול מערכת

- `initializeGridSystem()` - אתחול מלא של המערכת
- `initializeBasicGrid()` - אתחול גריד בסיסי
- `initializeTestGrid()` - אתחול גריד בדיקה
- `checkSystemAvailability()` - בדיקת זמינות המערכת

## דוגמאות שימוש

### דף רגיל עם גריד

```html
<!DOCTYPE html>
<html>
<head>
  <title>דף עם גריד</title>
  <link rel="stylesheet" href="styles/grid.css" />
</head>
<body>
  <div id="agGridFloating" class="ag-theme-quartz grid-container"></div>
  
  <script src="scripts/grid-table.js"></script>
  <script src="scripts/grid-filters.js"></script>
  <script src="scripts/grid-data.js"></script>
  <script src="scripts/grid-init.js"></script>
  
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      // אתחול אוטומטי
    });
  </script>
</body>
</html>
```

### דף עם פילטרים מותאמים אישית

```html
<!DOCTYPE html>
<html>
<head>
  <title>דף עם פילטרים</title>
  <link rel="stylesheet" href="styles/grid.css" />
</head>
<body>
  <div id="agGridFloating" class="ag-theme-quartz grid-container"></div>
  
  <script src="scripts/grid-table.js"></script>
  <script src="scripts/grid-filters.js"></script>
  <script src="scripts/grid-data.js"></script>
  <script src="scripts/grid-init.js"></script>
  
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      // אתחול עם פילטרים מותאמים אישית
      initializeGridWithFilters('#agGridFloating', {
        statuses: ['פתוח'],
        types: ['סווינג']
      });
    });
  </script>
</body>
</html>
```

### דף בדיקה

```html
<!DOCTYPE html>
<html>
<head>
  <title>דף בדיקת גריד</title>
  <link rel="stylesheet" href="styles/grid.css" />
</head>
<body>
  <!-- אלמנטי בדיקה ספציפיים לדף זה -->
  <div class="filter-test-section">
    <h3>בדיקת פילטר סטטוס</h3>
    <div class="checkbox-group">
      <label><input type="checkbox" id="status-open" checked><span>פתוח</span></label>
      <label><input type="checkbox" id="status-closed"><span>סגור</span></label>
      <label><input type="checkbox" id="status-cancelled"><span>מבוטל</span></label>
    </div>
  </div>

  <div class="stats-container">
    <div class="stats-item"><div class="stats-label">סה"כ</div><div class="stats-value stats-total">0</div></div>
    <div class="stats-item"><div class="stats-label">פתוח</div><div class="stats-value stats-open">0</div></div>
    <div class="stats-item"><div class="stats-label">סגור</div><div class="stats-value stats-closed">0</div></div>
    <div class="stats-item"><div class="stats-label">מבוטל</div><div class="stats-value stats-cancelled">0</div></div>
  </div>

  <div class="status-indicator">
    <div class="status-item"><div class="status-dot success"></div><span>גריד מוכן</span></div>
    <div class="status-item"><div class="status-dot warning"></div><span>טוען נתונים...</span></div>
  </div>

  <div id="agGridFloating" class="ag-theme-quartz grid-container"></div>
  
  <script src="scripts/grid-table.js"></script>
  <script src="scripts/grid-filters.js"></script>
  <script src="scripts/grid-data.js"></script>
  <script src="scripts/grid-init.js"></script>
  
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      // יצירת דף בדיקה מלא
      createTestPage();
    });
  </script>
</body>
</html>
```

## התאמה אישית

### הגדרת עמודות מותאמות אישית

```javascript
// יצירת גריד עם עמודות מותאמות אישית
const customColumnDefs = [
  { headerName: "שם", field: "name" },
  { headerName: "גיל", field: "age" }
];

createGrid('#agGridFloating', data, {
  columnDefs: customColumnDefs
});
```

### הוספת פונקציונליות מותאמת אישית

```javascript
// הוספת event listener מותאם אישית
document.addEventListener('gridReady', (event) => {
  console.log('Grid is ready:', event.detail);
  // הוספת פונקציונליות מותאמת אישית
});
```

## תמיכה בדפדפנים

המערכת תומכת בכל הדפדפנים המודרניים:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## פתרון בעיות

### הגריד לא מוצג

1. בדוק שהקבצים נטענים בסדר הנכון
2. בדוק שיש אלמנט עם ID `agGridFloating`
3. בדוק שה-AG Grid נטען לפני קבצי המערכת

### פילטרים לא עובדים

1. בדוק שמערכת הפילטרים מאותחלת
2. בדוק שהפונקציות הגלובליות זמינות
3. בדוק את ה-console לשגיאות

### נתונים לא נטענים

1. בדוק שהשרת זמין
2. בדוק את ה-network tab בדפדפן
3. בדוק שהפונקציה `loadPlansFromServer` מוגדרת

## עדכונים עתידיים

- תמיכה בפילטרים מתקדמים יותר
- אפשרות לייצא נתונים
- תמיכה בגרידים מרובים באותו דף
- שיפור הביצועים
- תמיכה במובייל מתקדמת

## תמיכה טכנית

לשאלות טכניות או בעיות, פנה לצוות הפיתוח או פתח issue במערכת הניהול הפרויקטים.
