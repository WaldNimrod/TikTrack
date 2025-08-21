# מערכת סידור טבלאות - TikTrack

## סקירה כללית

מערכת סידור הטבלאות מספקת פונקציונליות סידור אחידה לכל הטבלאות באתר TikTrack. המערכת תומכת בסידור לפי כל סוגי הנתונים, שמירת מצב ב-localStorage, ואייקונים דינמיים.

## תכונות עיקריות

### ✅ סידור נתונים
- **טקסט** - מיון אלפביתי (נכס, סוג, צד)
- **תאריכים** - מיון כרונולוגי (תאריך יצירה)
- **מספרים** - מיון מספרי (סכום, יעד, סטופ, נוכחי)
- **סטטוסים** - מיון לפי סדר מוגדר (פתוח, סגור, מבוטל)

### ✅ ממשק משתמש
- **אייקונים דינמיים** - ↕ (לא פעיל), ↑ (עולה), ↓ (יורד)
- **צבעים שונים** - אפור (לא פעיל), כתום (פעיל)
- **אנימציות חלקות** - מעברים של 0.3 שניות

### ✅ שמירת מצב
- **localStorage** - שמירת עמודה וכיוון סידור
- **טעינה אוטומטית** - שחזור מצב בטעינת הדף
- **נפרד לכל דף** - מצב שונה לכל טבלה

## ארכיטקטורה

### קבצים מעורבים

```
trading-ui/
├── scripts/
│   ├── main.js              # פונקציות גלובליות לסידור
│   ├── planning.js          # יישום ספציפי לדף תכנונים
│   ├── trades.js            # יישום ספציפי לדף מעקב טריידים
│   └── alerts.js            # יישום ספציפי לדף התראות
├── styles/
│   └── grid-table.css       # עיצובי אייקוני סידור
├── planning.html            # HTML עם כפתורי סידור
├── trades.html              # HTML עם כפתורי סידור למעקב
└── alerts.html              # HTML עם כפתורי סידור להתראות
```

### פונקציות גלובליות (main.js)

#### `sortTableData(columnIndex, data, pageName, updateTableFunction)`
הפונקציה הראשית לסידור טבלאות.

**פרמטרים:**
- `columnIndex` (number) - אינדקס העמודה (0-8)
- `data` (Array) - מערך הנתונים לסידור
- `pageName` (string) - שם הדף לשמירת מצב
- `updateTableFunction` (Function) - פונקציה לעדכון הטבלה

**דוגמה:**
```javascript
const sortedData = sortTableData(0, designsData, 'planning', updateDesignsTable);
```

#### פונקציות עזר לחילוץ ערכים
- `getTickerValue(item)` - חילוץ ערך ticker
- `getDateValue(item)` - חילוץ ערך תאריך
- `getTypeValue(item)` - חילוץ ערך סוג
- `getSideValue(item)` - חילוץ ערך צד
- `getAmountValue(item)` - חילוץ ערך סכום
- `getTargetValue(item)` - חילוץ ערך יעד
- `getStopValue(item)` - חילוץ ערך סטופ
- `getCurrentValue(item)` - חילוץ ערך נוכחי
- `getStatusValue(item)` - חילוץ ערך סטטוס

#### `getStatusForSort(status)`
ממירה סטטוסים לערכים מספריים לסידור עקבי.

**ערכים:**
- `'open'` → 1
- `'closed'` → 2
- `'cancelled'`/`'canceled'` → 3
- אחר → 0

#### `updateSortIcons(activeColumnIndex, pageName)`
מעדכנת את אייקוני הסידור בטבלה.

#### `loadSortState(pageName)`
טוענת מצב סידור מ-localStorage.

### יישום בדף ספציפי (planning.js)

#### `sortTable(columnIndex)`
פונקציה ספציפית לדף תכנונים המשתמשת במערכת הגלובלית.

```javascript
function sortTable(columnIndex) {
    if (typeof window.sortTableData === 'function') {
        const sortedData = window.sortTableData(
            columnIndex,
            window.filteredDesignsData || designsData,
            'planning',
            updateDesignsTable
        );
        window.filteredDesignsData = sortedData;
    }
}
```

## שימוש ב-HTML

### מבנה כפתור סידור
```html
<button class="sortable-header" onclick="sortTable(0)">
    <span class="sort-icon">↕</span>נכס
    <br><span class="header-subtitle">Ticker</span>
</button>
```

### עמודות נתמכות
| אינדקס | עמודה | סוג נתון | דוגמה |
|--------|-------|----------|-------|
| 0 | נכס | טקסט | AAPL, Apple Inc. |
| 1 | תאריך | תאריך | 2025-08-21 |
| 2 | סוג | טקסט | swing, investment |
| 3 | צד | טקסט | Long, Short |
| 4 | סכום | מספר | 1000, 500 |
| 5 | יעד | מספר | 150, 200 |
| 6 | סטופ | מספר | 100, 90 |
| 7 | נוכחי | מספר | 120, 110 |
| 8 | סטטוס | סטטוס | open, closed |

## עיצוב CSS

### אייקוני סידור
```css
.sortable-header .sort-icon {
    font-size: 0.7rem !important;
    margin-left: 0.3rem !important;
    opacity: 0.7 !important;
    transition: opacity 0.3s ease !important;
}

.sortable-header:hover .sort-icon {
    opacity: 1 !important;
}

.sortable-header.active-sort .sort-icon {
    opacity: 1 !important;
    color: #ff9c05 !important;
}
```

### מצבי אייקון
- **↕** - לא פעיל (אפור, opacity: 0.7)
- **↑** - סידור עולה (כתום, opacity: 1)
- **↓** - סידור יורד (כתום, opacity: 1)

## שמירת מצב

### localStorage Keys
```javascript
// לכל דף יש מפתחות ייחודיים
`${pageName}SortColumn`     // אינדקס העמודה הפעילה
`${pageName}SortDirection`  // כיוון הסידור ('asc' או 'desc')
```

### דוגמה
```javascript
// דף תכנונים
localStorage.setItem('planningSortColumn', '2');
localStorage.setItem('planningSortDirection', 'desc');

// דף התראות
localStorage.setItem('alertsSortColumn', '1');
localStorage.setItem('alertsSortDirection', 'asc');
```

## הרחבה לדפים נוספים

### שלבים להוספת סידור לדף חדש

1. **הוסף כפתורי סידור ל-HTML:**
```html
<button class="sortable-header" onclick="sortTable(0)">
    <span class="sort-icon">↕</span>כותרת
</button>
```

2. **צור פונקציית sortTable בדף:**
```javascript
function sortTable(columnIndex) {
    if (typeof window.sortTableData === 'function') {
        const sortedData = window.sortTableData(
            columnIndex,
            pageData,
            'pageName',
            updateTableFunction
        );
    }
}
```

3. **הוסף טעינת מצב בטעינת הדף:**
```javascript
if (typeof window.loadSortState === 'function') {
    window.loadSortState('pageName');
}
```

## פתרון בעיות

### בעיות נפוצות

#### אייקון לא מתעדכן
- **בדוק:** האם יש `class="sort-icon"` בתוך הכפתור
- **בדוק:** האם הפונקציה `updateSortIcons` נקראת

#### סידור לא עובד
- **בדוק:** האם הפונקציה `sortTableData` זמינה ב-`window`
- **בדוק:** האם הנתונים במבנה הנכון

#### מצב לא נשמר
- **בדוק:** האם `pageName` זהה בשמירה ובטעינה
- **בדוק:** האם localStorage פעיל בדפדפן

### דיבוג
```javascript
// בדיקת פונקציות זמינות
console.log('sortTableData:', typeof window.sortTableData);
console.log('loadSortState:', typeof window.loadSortState);

// בדיקת מצב שמור
console.log('Saved column:', localStorage.getItem('planningSortColumn'));
console.log('Saved direction:', localStorage.getItem('planningSortDirection'));
```

## היסטוריית גרסאות

### גרסה 2.0 (2025-08-21)
- ✅ מערכת גלובלית אחידה
- ✅ תמיכה במבני נתונים שונים
- ✅ שמירת מצב ב-localStorage
- ✅ אייקונים דינמיים
- ✅ תיעוד מקיף

### גרסה 1.0 (קודמת)
- ❌ פונקציות נפרדות לכל דף
- ❌ תמיכה מוגבלת במבני נתונים
- ❌ ללא שמירת מצב
- ❌ אייקונים סטטיים

## סיכום

מערכת סידור הטבלאות מספקת פתרון אחיד, גמיש ונוח לשימוש לכל הטבלאות באתר TikTrack. המערכת תומכת בכל סוגי הנתונים, שומרת מצב, ומספקת חוויית משתמש עקבית.

---

**מפתחים:** TikTrack Development Team  
**תאריך עדכון אחרון:** 2025-08-21  
**גרסה:** 2.0
