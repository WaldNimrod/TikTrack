# מערכת הגריד האוניברסלית - טעינת נתונים מבסיס הנתונים

## סקירה כללית

המערכת מאפשרת טעינת נתונים מבסיס הנתונים והצגתם בגריד אחיד בכל הדפים. הפונקציונליות נוספה לקובץ `grid-data.js` ומאפשרת גמישות מרבית בטעינת נתונים שונים.

## פונקציות עיקריות

### 1. `loadDataFromDatabase(config)`
טוען נתונים מבסיס הנתונים עם הגדרות מותאמות אישית.

**פרמטרים:**
- `config` (אופציונלי): הגדרות מותאמות אישית

**דוגמה:**
```javascript
const data = await loadDataFromDatabase({
  apiEndpoint: '/api/tradeplans',
  dataMapping: {
    ticker: 'ticker',
    date: 'created_at',
    type: 'investment_type',
    amount: 'planned_amount',
    target: 'target_price',
    stop: 'stop_price',
    current: 'current_price',
    status: 'status',
    action: 'action'
  }
});
```

### 2. `loadDataByType(dataType, customConfig)`
טוען נתונים לפי סוג מוגדר מראש.

**סוגי נתונים נתמכים:**
- `'tradeplans'` - תכנוני טריידים
- `'trades'` - טריידים
- `'alerts'` - התראות

**דוגמה:**
```javascript
const tradePlans = await loadDataByType('tradeplans');
const trades = await loadDataByType('trades');
const alerts = await loadDataByType('alerts');
```

### 3. `initializeGridWithDatabaseData(containerId, config)`
מאתחל גריד עם נתונים מבסיס הנתונים.

**דוגמה:**
```javascript
await initializeGridWithDatabaseData('#agGridFloating', {
  apiEndpoint: '/api/tradeplans',
  defaultFilters: {
    statuses: ['פתוח']
  }
});
```

### 4. `refreshDatabaseData(config)`
מרענן נתונים מבסיס הנתונים.

**דוגמה:**
```javascript
const newData = await refreshDatabaseData();
```

## הגדרות ברירת מחדל

```javascript
const DEFAULT_DATA_CONFIG = {
  apiEndpoint: '/api/tradeplans',
  dataMapping: {
    ticker: 'ticker',
    date: 'created_at',
    type: 'investment_type',
    amount: 'planned_amount',
    target: 'target_price',
    stop: 'stop_price',
    current: 'current_price',
    status: 'status',
    action: 'action'
  },
  statusMapping: {
    'open': 'פתוח',
    'closed': 'סגור',
    'pending': 'מבוטל',
    'canceled': 'מבוטל'
  },
  typeMapping: {
    'long': 'השקעה',
    'short': 'סווינג',
    'passive': 'פאסיבי'
  },
  defaultFilters: {
    statuses: ['פתוח']
  }
};
```

## שימוש בעמודים שונים

### דף תכנוני טריידים
```javascript
// אתחול גריד עם תכנוני טריידים
await initializeGridWithDatabaseData('#agGridFloating', {
  apiEndpoint: '/api/tradeplans',
  dataMapping: {
    ticker: 'ticker',
    date: 'created_at',
    type: 'investment_type',
    amount: 'planned_amount',
    target: 'target_price',
    stop: 'stop_price',
    current: 'current_price',
    status: 'status',
    action: 'action'
  }
});
```

### דף טריידים
```javascript
// אתחול גריד עם טריידים
await initializeGridWithDatabaseData('#agGridFloating', {
  apiEndpoint: '/api/trades',
  dataMapping: {
    ticker: 'ticker',
    date: 'opened_at',
    type: 'type',
    amount: 'total_pl',
    target: 'target_price',
    stop: 'stop_price',
    current: 'current_price',
    status: 'status',
    action: 'action'
  }
});
```

### דף התראות
```javascript
// אתחול גריד עם התראות
await initializeGridWithDatabaseData('#agGridFloating', {
  apiEndpoint: '/api/alerts',
  dataMapping: {
    ticker: 'ticker',
    date: 'created_at',
    type: 'alert_type',
    amount: 'condition',
    target: 'target_price',
    stop: 'stop_price',
    current: 'current_price',
    status: 'status',
    action: 'action'
  }
});
```

## פונקציות עזר

### `checkServerAvailability()`
בודק אם השרת זמין.

### `getCurrentDataSourceInfo()`
מחזיר מידע על מקור הנתונים הנוכחי.

### `loadFilteredDataFromDatabase(filters, config)`
טוען נתונים עם פילטרים.

## טיפול בשגיאות

המערכת מטפלת בשגיאות באופן אוטומטי:
1. אם השרת לא זמין, נטענים נתוני דוגמה
2. אם יש שגיאה בקריאה לשרת, נטענים נתוני דוגמה
3. כל השגיאות מודפסות לקונסול

## דוגמה מלאה לשימוש

```javascript
document.addEventListener('DOMContentLoaded', async () => {
  // בדיקת זמינות השרת
  const isServerAvailable = await checkServerAvailability();
  
  if (isServerAvailable) {
    // טעינת נתונים מבסיס הנתונים
    await initializeGridWithDatabaseData('#agGridFloating', {
      apiEndpoint: '/api/tradeplans',
      defaultFilters: {
        statuses: ['פתוח', 'סגור']
      }
    });
  } else {
    // שימוש בנתוני דוגמה
    initializeTestGrid();
  }
});
```

## בדיקה

כדי לבדוק את הפונקציונליות:
1. פתח את דף `grid-test.html`
2. השתמש בכפתורי הבדיקה החדשים
3. בדוק את הקונסול להודעות
4. וודא שהנתונים נטענים כראוי

## הגדרות עמודות מותאמות אישית

### הגדרת עמודות בדף HTML
כדי ליצור גריד עם עמודות שונות בכל דף, יש להגדיר את הפונקציות הבאות בדף ה-HTML:

```javascript
// הגדרת עמודות הגריד הספציפיות לדף זה
const getPageColumnDefs = () => [
  { 
    headerName: "שם עמודה", 
    field: "field_name", 
    width: 100,
    minWidth: 80,
    maxWidth: 150,
    cellRenderer: params => `תוכן מותאם אישית`
  }
  // ... עוד עמודות
];

// הגדרות הגריד הספציפיות לדף זה
const getPageGridOptions = (rowData = []) => ({
  columnDefs: getPageColumnDefs(),
  rowData: rowData,
  // ... הגדרות נוספות
});
```

### דוגמה מלאה
ראה את הקובץ `grid-example-custom.html` לדוגמה מלאה של גריד עם עמודות מותאמות אישית.

## הערות חשובות

1. **תאימות**: הפונקציונליות החדשה תואמת לכל הפונקציות הקיימות
2. **ברירת מחדל**: אם אין הגדרות מותאמות אישית, משתמשים בברירת המחדל
3. **פילטרים**: הפילטרים הקיימים עובדים גם עם נתונים מבסיס הנתונים
4. **ביצועים**: הנתונים נשמרים בזיכרון כדי למנוע קריאות מיותרות לשרת
5. **גמישות**: כל דף יכול להגדיר עמודות שונות לפי הצורך
