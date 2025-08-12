# מערכת הגריד המודולרית - TikTrack

## סקירה כללית

מערכת הגריד המודולרית מאפשרת שימוש אחיד בגריד בכל הדפים במערכת. המערכת מבטיחה שיהיה רק גריד אחד פעיל בכל רגע נתון ומשתמשת בקובץ הכללי. המערכת מחולקת לקבצים נפרדים לפי תפקידים:

### קבצי המערכת

1. **`grid-core.js`** - לוגיקת הגריד הבסיסית
2. **`grid-filters.js`** - מערכת הפילטרים
3. **`grid-data.js`** - ניהול נתונים
4. **`grid-init.js`** - אתחול המערכת
5. **`grid.css`** - סגנונות הגריד

## איך להשתמש במערכת

### אלמנטים אוניברסליים vs אלמנטים ספציפיים

**אלמנטים אוניברסליים** (נוצרים אוטומטית):
- הגריד עצמו (`#agGridFloating`)
- פונקציונליות בסיסית
- פילטרים אוטומטיים

**אלמנטים ספציפיים** (צריכים להיות בדף):
- `filter-test-section` - אזור בדיקת פילטרים
- `stats-container` - תצוגת סטטיסטיקות
- `status-indicator` - אינדיקטור סטטוס
- כפתורי בדיקה

### מניעת כפילות

המערכת כוללת מנגנונים למניעת כפילות:
- **גריד יחיד** - רק גריד אחד יכול להיות פעיל בכל רגע נתון
- **Event Listeners יחידים** - כל אלמנט מקבל event listener רק פעם אחת
- **אתחול חד פעמי** - הפונקציות בודקות אם המערכת כבר מאותחלת

### 1. הוספת קבצי הסקריפט לדף

```html
<!-- Grid System Scripts -->
<script src="scripts/grid-core.js"></script>
<script src="scripts/grid-filters.js"></script>
<script src="scripts/grid-data.js"></script>
<script src="scripts/grid-init.js"></script>
```

### 2. הוספת קובץ הסגנונות

```html
<link rel="stylesheet" href="styles/grid.css" />
```

### 3. יצירת אלמנט גריד

```html
<div id="agGridFloating" class="ag-theme-quartz grid-container" style="height: 500px; width: 100%;"></div>
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

### ניהול גריד

- `createGrid(containerId, rowData, customOptions)` - יצירת גריד חדש
- `updateGridData(newData)` - עדכון נתוני הגריד
- `refreshGrid()` - רענון הגריד
- `clearGrid()` - ניקוי הגריד

### ניהול פילטרים

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
  
  <script src="scripts/grid-core.js"></script>
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
  
  <script src="scripts/grid-core.js"></script>
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
  
  <script src="scripts/grid-core.js"></script>
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
