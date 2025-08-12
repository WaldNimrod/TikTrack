# מערכת עמודות גמישה לגריד

## סקירה כללית

המערכת החדשה מאפשרת לכל עמוד להגדיר עמודות שונות לגריד בקלות ובגמישות.

## דרכים להגדרת עמודות

### 1. הגדרת עמודות מלאה לכל עמוד

```javascript
// הגדרת עמודות מותאמות אישית לעמוד
window.getPageColumnDefs = () => [
  { 
    headerName: "המרה", 
    field: "action", 
    width: 60,
    cellRenderer: params => `<span style="cursor: pointer;">${params.value}</span>`
  },
  { 
    headerName: "חשבון", 
    field: "account", 
    width: 120,
    filter: true,
    cellRenderer: params => {
      const value = params.value || 'N/A';
      return `<span style="color: #29a6a8;">${value}</span>`;
    }
  },
  // ... עוד עמודות
];
```

### 2. שימוש בפונקציה עזר

```javascript
// הגדרת עמודות באמצעות פונקציה עזר
const myColumns = [
  { headerName: "שם", field: "name", width: 100 },
  { headerName: "סטטוס", field: "status", width: 80 },
  // ... עוד עמודות
];

window.setPageColumnDefs(myColumns);
```

### 3. הוספת עמודה לעמודות ברירת המחדל

```javascript
// הוספת עמודה לעמודות ברירת המחדל
const newColumn = {
  headerName: "פעולות",
  field: "actions",
  width: 100,
  cellRenderer: params => {
    return `<button onclick="doAction('${params.data.id}')">פעולה</button>`;
  }
};

window.addColumnToDefaultDefs(newColumn);
```

## דוגמאות שימוש

### עמוד עם עמודות מותאמות אישית

```html
<script>
  // הגדרת עמודות ספציפיות לעמוד זה
  window.getPageColumnDefs = () => [
    { headerName: "מזהה", field: "id", width: 80 },
    { headerName: "שם", field: "name", width: 150 },
    { headerName: "חשבון", field: "account", width: 120 },
    { headerName: "סטטוס", field: "status", width: 100 },
    { headerName: "פעולות", field: "actions", width: 120,
      cellRenderer: params => `<button onclick="editItem(${params.data.id})">ערוך</button>`
    }
  ];
</script>
```

### הוספת עמודה דינמית

```javascript
// הוספת עמודה חדשה בזמן ריצה
function addNewColumn() {
  const currentDefs = window.getPageColumnDefs();
  const newColumn = {
    headerName: "תאריך יצירה",
    field: "created_at",
    width: 120,
    cellRenderer: params => {
      return new Date(params.value).toLocaleDateString('he-IL');
    }
  };
  
  currentDefs.push(newColumn);
  window.setPageColumnDefs(currentDefs);
  
  // רענון הגריד
  if (window.gridApi) {
    window.gridApi.setColumnDefs(currentDefs);
  }
}
```

## תכונות מתקדמות

### פילטרים מובנים

```javascript
{
  headerName: "סטטוס",
  field: "status",
  filter: true,
  filterParams: {
    filterOptions: ['equals', 'notEqual', 'contains'],
    defaultOption: 'equals'
  }
}
```

### עיצוב מותאם אישית

```javascript
{
  headerName: "סכום",
  field: "amount",
  cellRenderer: params => {
    const value = params.value;
    const color = value > 0 ? '#28a745' : '#dc3545';
    return `<span style="color: ${color}; font-weight: bold;">$${value}</span>`;
  }
}
```

### פעולות מותאמות אישית

```javascript
{
  headerName: "פעולות",
  field: "actions",
  cellRenderer: params => {
    return `
      <button onclick="editItem(${params.data.id})" class="btn btn-sm btn-primary">ערוך</button>
      <button onclick="deleteItem(${params.data.id})" class="btn btn-sm btn-danger">מחק</button>
    `;
  }
}
```

## הערות חשובות

1. **סדר טעינה**: יש להגדיר `window.getPageColumnDefs` לפני טעינת הגריד
2. **תאימות**: המערכת תואמת לכל הגרידים במערכת
3. **ברירת מחדל**: אם לא מוגדרות עמודות מותאמות אישית, המערכת תשתמש בעמודות ברירת המחדל
4. **רענון**: לאחר שינוי עמודות, יש לרענן את הגריד באמצעות `window.gridApi.setColumnDefs()`

## פונקציות זמינות

- `window.getPageColumnDefs()` - הגדרת עמודות מותאמות אישית
- `window.setPageColumnDefs(columnDefs)` - הגדרת עמודות באמצעות פונקציה עזר
- `window.addColumnToDefaultDefs(newColumn)` - הוספת עמודה לעמודות ברירת המחדל
