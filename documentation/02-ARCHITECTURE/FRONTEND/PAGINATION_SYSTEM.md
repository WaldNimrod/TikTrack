# מערכת Pagination System

## Pagination System Documentation

**תאריך יצירה:** 27 בינואר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ הושלם

---

## 📋 סקירה כללית

מערכת Pagination System היא מערכת כללית לניהול pagination (עימוד) של טבלאות במערכת TikTrack. המערכת מספקת ממשק אחיד, ביצועים מיטביים, תמיכה בהעדפות משתמש, ועיצוב RTL מלא.

### תכונות עיקריות

- ✅ **ממשק אחיד** - עיצוב זהה בכל הטבלאות
- ✅ **תצוגה כפולה** - תצוגה מצומצמת מעל הטבלה ותצוגה מלאה מתחת
- ✅ **Tabler Icons** - שימוש באיקונים מודרניים
- ✅ **הגנה מפני מודולים** - טבלאות במודולים לא מקבלות pagination
- ✅ **תמיכה בהעדפות** - שמירת גודל עמוד לפי העדפות משתמש
- ✅ **ביצועים מיטביים** - תמיכה בטבלאות גדולות
- ✅ **RTL מלא** - תמיכה מלאה בעברית וכיוון RTL

---

## 📁 מבנה קבצים

```
trading-ui/
├── scripts/
│   └── pagination-system.js       # המערכת המרכזית
├── styles-new/
│   └── 06-components/
│       └── _pagination-system.css  # עיצוב Pagination
└── styles-new/
    └── master.css                  # טעינת Tabler Icons CDN
```

---

## 🎯 שימוש בסיסי

### יצירת Pagination

```javascript
// דרך updateTableWithPagination (מומלץ)
await window.updateTableWithPagination({
    tableId: 'tradesTable',
    tableType: 'trades',
    data: tradesData,
    render: async (pageData, context) => {
        // רינדור שורות הטבלה
        const tbody = document.querySelector('#tradesTable tbody');
        tbody.innerHTML = renderTableRows(pageData);
    },
    pageSize: 20, // אופציונלי
    onFilteredDataChange: ({ filteredData }) => {
        // עדכון סטטיסטיקות, למשל
    }
});
```

### יצירה ידנית

```javascript
// דרך PaginationSystem.create
const pagination = window.PaginationSystem.create('tradesTable', {
    tableType: 'trades',
    pageSize: 20,
    data: tradesData,
    onAfterRender: ({ pageData }) => {
        // עדכון טבלה
    }
});

// עדכון נתונים
pagination.setData(newData);
pagination.render();
```

---

## 🎨 עיצוב UI

### מבנה HTML - תצוגה מלאה (מתחת לטבלה)

האלמנטים לפי סדר:

1. **כפתור "הקודם"** - איקון בלבד, קטן
2. **לייבל:** "ע. [מספר עמוד] מ: [סה"כ עמודים]"
3. **כפתור "הבא"** - איקון בלבד, קטן
4. **לייבל:** "[מפריט]-[עד פריט] מתוך: [סה"כ פריטים]"
5. **דרופדאון** - "מספר רשומות לעמוד" (קטן 25%, ללא border, ללא padding)

```html
<div class="pagination-container">
    <div class="pagination-wrapper">
        <button class="pagination-btn pagination-btn-icon-only">
            <i class="ti ti-chevron-right"></i>
        </button>
        <span class="page-info">ע. 1 מ: 5</span>
        <button class="pagination-btn pagination-btn-icon-only">
            <i class="ti ti-chevron-left"></i>
        </button>
        <span class="items-info">1-20 מתוך: 100</span>
        <select class="page-size-selector">
            <option value="20" selected>20 פריטים</option>
        </select>
    </div>
</div>
```

### מבנה HTML - תצוגה מצומצמת (מעל הטבלה)

רק כפתורי ניווט + מספר עמוד:

```html
<div class="pagination-container pagination-container-compact">
    <div class="pagination-compact-wrapper">
        <button class="pagination-btn pagination-btn-icon-only">
            <i class="ti ti-chevron-right"></i>
        </button>
        <span class="page-info-compact">ע. 1 מ: 5</span>
        <button class="pagination-btn pagination-btn-icon-only">
            <i class="ti ti-chevron-left"></i>
        </button>
    </div>
</div>
```

---

## 🔧 API Reference

### PaginationSystem (Global Object)

#### `PaginationSystem.create(tableId, options)`

יצירת instance חדש של pagination.

**Parameters:**

- `tableId` (string) - מזהה הטבלה (ID attribute)
- `options` (Object) - אפשרויות קונפיגורציה:
  - `tableType` (string) - סוג הטבלה (data-table-type)
  - `pageSize` (number) - גודל עמוד (ברירת מחדל: 20)
  - `maxPageSize` (number) - גודל עמוד מקסימלי (ברירת מחדל: 100)
  - `minPageSize` (number) - גודל עמוד מינימלי (ברירת מחדל: 5)
  - `showPageSizeSelector` (boolean) - הצגת דרופדאון (ברירת מחדל: true)
  - `showPageInfo` (boolean) - הצגת מידע עמוד (ברירת מחדל: true)
  - `showNavigation` (boolean) - הצגת כפתורי ניווט (ברירת מחדל: true)
  - `data` (Array) - מערך הנתונים
  - `onPageChange` (Function) - callback בעת שינוי עמוד
  - `onPageSizeChange` (Function) - callback בעת שינוי גודל עמוד
  - `onAfterRender` (Function) - callback לאחר רינדור
  - `onFilteredDataChange` (Function) - callback בעת שינוי נתונים מסוננים
  - `useRegistry` (boolean) - שימוש ב-TableDataRegistry (ברירת מחדל: true)
  - `showCompactPagination` (boolean) - הצגת תצוגה מצומצמת (ברירת מחדל: true)

**Returns:** `PaginationInstance` או `null` (אם הטבלה במודול)

**Example:**

```javascript
const pagination = window.PaginationSystem.create('tradesTable', {
    tableType: 'trades',
    pageSize: 20,
    data: tradesData,
    showCompactPagination: true
});
```

#### `PaginationSystem.get(tableId)`

קבלת instance קיים של pagination.

**Parameters:**

- `tableId` (string) - מזהה הטבלה

**Returns:** `PaginationInstance` או `null`

#### `PaginationSystem.destroy(tableId)`

מחיקת instance של pagination.

**Parameters:**

- `tableId` (string) - מזהה הטבלה

---

### PaginationInstance (Class)

#### `setData(data)`

עדכון הנתונים ב-pagination.

**Parameters:**

- `data` (Array) - מערך הנתונים החדש

#### `getCurrentPageData()`

קבלת הנתונים של העמוד הנוכחי.

**Returns:** `Array` - מערך הנתונים של העמוד הנוכחי

#### `nextPage()`

מעבר לעמוד הבא.

#### `previousPage()`

מעבר לעמוד הקודם.

#### `goToPage(pageNumber)`

מעבר לעמוד מסוים.

**Parameters:**

- `pageNumber` (number) - מספר העמוד

#### `setPageSize(newPageSize)`

שינוי גודל עמוד.

**Parameters:**

- `newPageSize` (number) - גודל עמוד חדש

#### `render()`

רינדור ה-pagination (יצירת ה-HTML והוספה ל-DOM).

---

### Helper Functions

#### `window.createPagination(tableId, options)`

Wrapper ל-`PaginationSystem.create()`.

#### `window.getPagination(tableId)`

Wrapper ל-`PaginationSystem.get()`.

#### `window.destroyPagination(tableId)`

Wrapper ל-`PaginationSystem.destroy()`.

#### `window.ensureTablePagination(tableId, options)`

יצירה או עדכון של pagination קיים.

**Parameters:**

- `tableId` (string) - מזהה הטבלה
- `options` (Object) - אפשרויות קונפיגורציה

**Returns:** `PaginationInstance`

#### `window.updateTableWithPagination(options)`

פונקציה מרכזית לאינטגרציה עם טבלאות.

**Parameters:**

- `options.tableId` (string) - מזהה הטבלה
- `options.tableType` (string) - סוג הטבלה
- `options.data` (Array) - מערך הנתונים
- `options.render` (Function) - פונקציית רינדור (מקבלת pageData, context)
- `options.pageSize` (number) - גודל עמוד
- `options.onFilteredDataChange` (Function) - callback בעת שינוי נתונים מסוננים
- `options.skipRegistry` (boolean) - דילוג על TableDataRegistry

**Returns:** `Promise<PaginationInstance|null>`

**Example:**

```javascript
await window.updateTableWithPagination({
    tableId: 'tradesTable',
    tableType: 'trades',
    data: tradesData,
    render: async (pageData, context) => {
        const tbody = document.querySelector('#tradesTable tbody');
        tbody.innerHTML = renderTableRows(pageData);
    }
});
```

---

## 🛡️ הגנה מפני מודולים

המערכת מזהה טבלאות בתוך modals ומניעה יצירת pagination עבורן.

**זיהוי מודולים:**

```javascript
table.closest('.modal, [class*="modal"]')
```

**נקודות בדיקה:**

1. `PaginationSystem.create()` - בודק לפני יצירה
2. `PaginationInstance.render()` - בודק לפני רינדור
3. `updateTableWithPagination()` - בודק לפני אינטגרציה

**התנהגות:**

- אם טבלה נמצאת במודול, המערכת מחזירה `null` ולא יוצרת pagination
- מוצג `console.warn` למפתח
- הטבלה מציגה את כל הנתונים (ללא pagination)

---

## 🎨 Tabler Icons

המערכת משתמשת ב-Tabler Icons לכפתורי ניווט.

**Icons:**

- `ti-chevron-right` - כפתור "הקודם" (RTL)
- `ti-chevron-left` - כפתור "הבא" (RTL)

**טעינה:**
Tabler Icons נטענים מ-CDN דרך `master.css`:

```css
@import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');
```

---

## 💾 העדפות משתמש

המערכת תומכת בשמירת העדפות משתמש עבור גודל עמוד.

**שימוש:**

```javascript
// שמירת העדפה
pagination.setPageSize(50); // נשמר אוטומטית

// טעינת העדפה
const savedPageSize = window.getPaginationSize('trades'); // מחזיר העדפה שמורה
```

---

## 🔄 אינטגרציה עם TableDataRegistry

המערכת משתמשת ב-`TableDataRegistry` לשמירת נתונים וסינכרון.

**תכונות:**

- שמירת נתונים מלאים
- שמירת נתונים מסוננים
- שמירת נתוני עמוד נוכחי
- סינכרון עם מערכות אחרות

---

## 📱 Responsive Design

המערכת תומכת ב-responsive design.

**Breakpoints:**

- **≤768px:** Flex-direction: column, יישור מרכזי, כפתורים עם min-width 100px

**עיצוב:**

- תצוגה מלאה: `justify-content: flex-start`, gap: 10px
- תצוגה מצומצמת: `justify-content: center`, gap: 8px

---

## 🎯 דוגמאות שימוש

### דוגמה 1: אינטגרציה בסיסית

```javascript
async function updateTradesTable(tradesData) {
    await window.updateTableWithPagination({
        tableId: 'tradesTable',
        tableType: 'trades',
        data: tradesData,
        render: async (pageData, context) => {
            const tbody = document.querySelector('#tradesTable tbody');
            tbody.innerHTML = renderTradesTableRows(pageData);
            
            // עדכון סטטיסטיקות
            updateTradesSummary(pageData);
        },
        onFilteredDataChange: ({ filteredData }) => {
            updateTradesSummary(filteredData);
        }
    });
}
```

### דוגמה 2: שימוש עם fallback

```javascript
async function updateTable(data) {
    const { skipPagination = false } = options;
    
    if (!skipPagination && typeof window.updateTableWithPagination === 'function') {
        try {
            await window.updateTableWithPagination({
                tableId: 'myTable',
                tableType: 'my_type',
                data: data,
                render: async (pageData) => {
                    renderTableRows(pageData);
                }
            });
            return;
        } catch (error) {
            console.warn('Pagination failed, falling back to direct render', error);
        }
    }
    
    // Fallback: render כל הנתונים
    renderTableRows(data);
}
```

### דוגמה 3: שליטה ידנית

```javascript
const pagination = window.PaginationSystem.create('myTable', {
    tableType: 'my_type',
    pageSize: 50,
    data: myData,
    showCompactPagination: true,
    onAfterRender: ({ pageData }) => {
        updateTable(pageData);
    }
});

// עדכון נתונים
pagination.setData(newData);
pagination.render();

// מעבר לעמוד 3
pagination.goToPage(3);
```

---

## 🐛 פתרון בעיות

### Pagination לא מופיע

**סיבות אפשריות:**

1. הטבלה נמצאת במודול (נבדק אוטומטית)
2. `render()` לא נקרא
3. הנתונים ריקים

**פתרון:**

```javascript
// בדיקה ידנית
const table = document.getElementById('myTable');
const isInModal = table.closest('.modal, [class*="modal"]');
if (isInModal) {
    console.log('Table is in modal, pagination skipped');
}

// קריאה ידנית ל-render
const pagination = window.getPagination('myTable');
if (pagination) {
    pagination.render();
}
```

### תצוגה מצומצמת לא מופיעה

**סיבה:** `showCompactPagination` מוגדר ל-`false`

**פתרון:**

```javascript
const pagination = window.PaginationSystem.create('myTable', {
    showCompactPagination: true // מופעל כברירת מחדל
});
```

### Tabler Icons לא מופיעים

**סיבה:** CDN לא נטען

**פתרון:**
וודא ש-`master.css` כולל:

```css
@import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');
```

---

## 📚 קבצים קשורים

- `trading-ui/scripts/pagination-system.js` - המערכת המרכזית
- `trading-ui/scripts/tables.js` - `updateTableWithPagination()`
- `trading-ui/styles-new/06-components/_pagination-system.css` - עיצוב
- `trading-ui/styles-new/master.css` - טעינת Tabler Icons

---

## 🔗 קישורים

- [דוח בדיקות](../05-REPORTS/PAGINATION_SYSTEM_TESTING_REPORT.md)
- [מסמך סטנדרטיזציה](../frontend/UI_STANDARDIZATION_WORK_DOCUMENT.md)
- [רשימת מערכות כלליות](../frontend/GENERAL_SYSTEMS_LIST.md)

---

**עודכן לאחרונה:** 27 בינואר 2025

