# הצעת שיפור למערכת הסידור בטבלאות

## בעיות נוכחיות

1. **רישום ידני** - כל טבלה חדשה דורשת עדכון ידני ב-`tables.js` (שורות 484-538)
2. **תלות במשתנים גלובליים** - כל טבלה צריכה משתנה גלובלי ספציפי
3. **פונקציות עדכון לא אחידות** - כל טבלה צריכה לייצא פונקציה ספציפית
4. **חתימות מרובות** - `window.sortTable` מקבל פרמטרים שונים, מבלבל
5. **קונפליקטים** - event-handler-manager מתערב עם onclick handlers

## פתרון מוצע

### 1. Table Registry System

```javascript
// רישום מרכזי של כל הטבלאות
window.TableRegistry = {
  register(tableType, config) {
    this._tables[tableType] = {
      dataGetter: config.dataGetter,      // function() => Array
      updateFunction: config.updateFunction, // function(data) => void
      tableSelector: config.tableSelector   // '#tableId' or null for auto-detect
    };
  },
  
  getConfig(tableType) {
    return this._tables[tableType] || null;
  },
  
  _tables: {}
};
```

### 2. Auto-detection מהקוד

```javascript
// כל טבלה תירשם פעם אחת
window.TableRegistry.register('positions', {
  dataGetter: () => window.positionsPortfolioState?.positionsData || [],
  updateFunction: (data) => window.updatePositionsTable?.(data),
  tableSelector: '#positionsTable'
});

window.TableRegistry.register('portfolio', {
  dataGetter: () => window.positionsPortfolioState?.portfolioData?.positions || [],
  updateFunction: (data) => window.updatePortfolioTable?.(data),
  tableSelector: '#portfolioTable'
});
```

### 3. פונקציית סידור פשוטה

```javascript
window.sortTable = function(tableTypeOrColumnIndex, columnIndex) {
  // אם רק columnIndex - auto-detect מהטבלה שנקלחה
  if (typeof tableTypeOrColumnIndex === 'number') {
    const clickedElement = event?.target?.closest('button.sortable-header');
    const table = clickedElement?.closest('table[data-table-type]');
    if (!table) return;
    const tableType = table.getAttribute('data-table-type');
    columnIndex = tableTypeOrColumnIndex;
    tableTypeOrColumnIndex = tableType;
  }
  
  // קבלת קונפיגורציה מהרישום
  const config = window.TableRegistry.getConfig(tableTypeOrColumnIndex);
  if (!config) {
    console.warn(`Table type "${tableTypeOrColumnIndex}" not registered`);
    return;
  }
  
  // קבלת נתונים
  const data = config.dataGetter();
  if (!Array.isArray(data) || data.length === 0) return;
  
  // סידור
  const sortedData = window.sortTableData(columnIndex, data, tableTypeOrColumnIndex, config.updateFunction);
  return sortedData;
};
```

## יתרונות

✅ **פשטות** - רישום חד-פעמי במקום if/else ענק  
✅ **יציבות** - פחות תלות במשתנים גלובליים  
✅ **תחזוקה** - קל להוסיף טבלאות חדשות  
✅ **עקביות** - אותו API לכל הטבלאות  
✅ **אוטומציה** - זיהוי אוטומטי מ-data-table-type  

## מימוש

### שלב 1: יצירת TableRegistry
- הוספת registry system ל-`tables.js`

### שלב 2: רישום טבלאות קיימות
- רישום כל הטבלאות הקיימות (positions, portfolio, cash_flows, alerts, וכו')

### שלב 3: פשטת window.sortTable
- החלפת הלוגיקה המורכבת ב-call ל-registry

### שלב 4: הסרת רשימת if/else
- מחיקת הקוד הישן (שורות 484-538)

## הערות

- **תואם לאחור** - הקוד הקיים ימשיך לעבוד
- **הדרגתי** - אפשר ליישם טבלה אחת בכל פעם
- **תיעוד** - כל טבלה תתועד ב-registry

