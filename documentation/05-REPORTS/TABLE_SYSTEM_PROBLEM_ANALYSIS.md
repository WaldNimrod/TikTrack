# ניתוח בעיות מערכת הטבלאות - Trading Accounts Page

## תאריך: 2025-01-27

---

## סיכום הבעיות

### בעיה #1: `Maximum call stack size exceeded` במהלך מיון
**תסמינים:**
- שגיאות `Maximum call stack size exceeded` מופיעות בעת מיון טבלאות `trading_accounts`, `positions`, `portfolio`
- השגיאות חוזרות למרות מנגנוני הגנה מפני רקורסיה

**מיקום השגיאות:**
- `TableSorter.sort()` ב-`unified-table-system.js`
- `window.sortTableData()` ב-`tables.js`
- קריאות רקורסיביות בין שתי הפונקציות

### בעיה #2: `window.TABLE_COLUMN_MAPPINGS` לא נמצא
**תסמינים:**
- הבדיקה `window.TABLE_COLUMN_MAPPINGS exists (retry)` נכשלת
- גם לאחר retry של 500ms, המשתנה עדיין לא נמצא
- זה מצביע על בעיה בסיסית בטעינת `table-mappings.js`

---

## ניתוח מעמיק

### בעיה #1: רקורסיה אינסופית במיון

#### גורמים אפשריים:

1. **מנגנון הגנה לא מספיק:**
   - `TableSorter.sort()` בודק `this._globalSortingFlag` ו-`window._sortTableDataInProgress`
   - `window.sortTableData()` בודק רק `window._sortTableDataInProgress`
   - **בעיה**: אם `TableSorter.sort()` נקרא לפני ש-`window.sortTableData()` מספיק להגדיר את הדגל, יש חלון זמן שבו רקורסיה יכולה להתרחש

2. **עדכון DOM מפעיל אירועים מחדש:**
   - `updateFunction` מעדכן את ה-DOM
   - עדכון DOM יכול להפעיל מחדש event listeners
   - למרות ש-`pointer-events: none` מוגדר, ייתכן שיש event listeners אחרים (למשל `MutationObserver` או event delegation)

3. **קריאה כפולה ל-`sortTableData`:**
   - `TableSorter.sort()` קורא ל-`window.sortTableData()`
   - `window.sortTable()` (מ-`tables.js`) גם קורא ל-`window.sortTableData()`
   - אם שניהם נקראים במקביל, יש רקורסיה

4. **`updateFunction` מפעיל מיון נוסף:**
   - `updateFunction` (למשל `updateTradingAccountsTable`) יכול להכיל לוגיקה שמפעילה מיון
   - זה יוצר רקורסיה: מיון → עדכון → מיון → עדכון...

#### דרכי תחקור:

**שיטה 1: הוספת לוגים מפורטים**
```javascript
// ב-TableSorter.sort()
console.log(`[TableSorter] sort called: tableType=${tableType}, columnIndex=${columnIndex}, flag=${this._globalSortingFlag}, globalFlag=${window._sortTableDataInProgress}`);
console.trace('Stack trace');

// ב-window.sortTableData()
console.log(`[sortTableData] called: tableType=${tableType}, columnIndex=${columnIndex}, flag=${window._sortTableDataInProgress}`);
console.trace('Stack trace');
```

**שיטה 2: בדיקת קריאות כפולות**
```javascript
// הוסף counter לכל קריאה
window._sortCallCount = (window._sortCallCount || 0) + 1;
console.log(`[SORT CALL #${window._sortCallCount}] tableType=${tableType}, columnIndex=${columnIndex}`);
```

**שיטה 3: בדיקת `updateFunction`**
```javascript
// עטוף את `updateFunction` ב-wrapper שמזהה קריאות רקורסיביות
const originalUpdateFunction = config.updateFunction;
const wrappedUpdateFunction = (data) => {
  if (window._updateFunctionInProgress) {
    console.error('RECURSION DETECTED in updateFunction!');
    console.trace();
    return;
  }
  window._updateFunctionInProgress = true;
  try {
    originalUpdateFunction(data);
  } finally {
    window._updateFunctionInProgress = false;
  }
};
```

**שיטה 4: בדיקת event listeners**
```javascript
// בדוק כמה event listeners יש על sortable headers
const headers = document.querySelectorAll('.sortable-header');
headers.forEach((header, index) => {
  const listeners = getEventListeners(header); // Chrome DevTools
  console.log(`Header ${index} has ${Object.keys(listeners).length} event listeners`);
});
```

### בעיה #2: `window.TABLE_COLUMN_MAPPINGS` לא נטען

#### גורמים אפשריים:

1. **`table-mappings.js` לא נטען כלל:**
   - שגיאה ב-`package-manifest.js` (שם קובץ שגוי, נתיב שגוי)
   - שגיאה JavaScript ב-`table-mappings.js` שמונעת את הטעינה
   - `globalCheck` נכשל ב-`package-manifest.js`

2. **טעינה מאוחרת מדי:**
   - למרות ש-`table-mappings.js` בטעינה `loadOrder: 0` ב-`ui-advanced` package
   - `modules` package נטען ב-`loadOrder: 3.5` (אחרי `ui-advanced`)
   - `data-basic.js` ב-`modules` package יכול לנסות לגשת ל-`window.TABLE_COLUMN_MAPPINGS` לפני שהוא נטען

3. **ייצוא מותנה נכשל:**
   - `table-mappings.js` מייצא את `window.TABLE_COLUMN_MAPPINGS` ישירות (שורה 759)
   - אבל אם יש שגיאה לפני השורה הזו, הייצוא לא קורה

4. **דחיפה/עריכה על ידי קובץ אחר:**
   - `data-basic.js` יכול לדחוף את `window.TABLE_COLUMN_MAPPINGS` אם הוא נטען לפני `table-mappings.js`
   - למרות שהבדיקה ב-`data-basic.js` אמורה למנוע זאת, ייתכן שיש בעיה בלוגיקה

#### דרכי תחקור:

**שיטה 1: בדיקת טעינת הקבצים**
```javascript
// הוסף ל-`table-mappings.js` בתחילת הקובץ
console.log('🔵 [table-mappings.js] FILE LOADING STARTED');
console.log('🔵 [table-mappings.js] Current window.TABLE_COLUMN_MAPPINGS:', window.TABLE_COLUMN_MAPPINGS);

// הוסף בסוף הקובץ (לפני הייצוא)
console.log('🔵 [table-mappings.js] About to export TABLE_COLUMN_MAPPINGS');
console.log('🔵 [table-mappings.js] TABLE_COLUMN_MAPPINGS keys:', Object.keys(TABLE_COLUMN_MAPPINGS));

// הוסף אחרי הייצוא
console.log('🔵 [table-mappings.js] Exported to window.TABLE_COLUMN_MAPPINGS');
console.log('🔵 [table-mappings.js] window.TABLE_COLUMN_MAPPINGS keys:', Object.keys(window.TABLE_COLUMN_MAPPINGS || {}));
```

**שיטה 2: בדיקת סדר הטעינה**
```javascript
// הוסף ל-`tables.js` בתחילת הקובץ
console.log('🟢 [tables.js] FILE LOADING STARTED');
console.log('🟢 [tables.js] window.TABLE_COLUMN_MAPPINGS exists:', !!window.TABLE_COLUMN_MAPPINGS);

// הוסף ל-`data-basic.js` בתחילת הקובץ
console.log('🟡 [data-basic.js] FILE LOADING STARTED');
console.log('🟡 [data-basic.js] window.TABLE_COLUMN_MAPPINGS exists:', !!window.TABLE_COLUMN_MAPPINGS);
```

**שיטה 3: בדיקת שגיאות JavaScript**
```javascript
// בדוק את ה-console של הדפדפן לשגיאות JavaScript
// שגיאות יכולות למנוע את טעינת הקובץ
```

**שיטה 4: בדיקת `package-manifest.js`**
```javascript
// ודא ש-`table-mappings.js` מופיע ב-`ui-advanced` package עם:
// - `loadOrder: 0` (לפני `tables.js` עם `loadOrder: 1`)
// - `globalCheck: 'window.TABLE_COLUMN_MAPPINGS'`
// - `required: true`
```

---

## תוכנית תיקון מסודרת

### שלב 1: תיקון בעיית `window.TABLE_COLUMN_MAPPINGS`

#### פעולה 1.1: הוספת לוגים ל-`table-mappings.js`
- הוסף לוגים בתחילת הקובץ, לפני הייצוא, ואחרי הייצוא
- זה יעזור לזהות אם הקובץ נטען בכלל

#### פעולה 1.2: בדיקת `package-manifest.js`
- ודא ש-`table-mappings.js` מופיע ב-`ui-advanced` package
- ודא ש-`loadOrder: 0` (לפני `tables.js`)
- ודא ש-`globalCheck: 'window.TABLE_COLUMN_MAPPINGS'` נכון

#### פעולה 1.3: בדיקת `data-basic.js`
- ודא שהבדיקה `if (typeof window.getColumnValue !== 'function')` נכונה
- ודא שהבדיקה `if (!window.TABLE_COLUMN_MAPPINGS || Object.keys(window.TABLE_COLUMN_MAPPINGS).length === 0)` נכונה
- הוסף לוגים כדי לראות מה קורה

#### פעולה 1.4: בדיקת שגיאות JavaScript
- פתח את ה-console של הדפדפן
- בדוק אם יש שגיאות JavaScript שמונעות את טעינת `table-mappings.js`

### שלב 2: תיקון בעיית הרקורסיה

#### פעולה 2.1: שיפור מנגנון הגנה מפני רקורסיה
- ודא ש-`TableSorter.sort()` ו-`window.sortTableData()` משתמשים באותו דגל גלובלי
- הוסף בדיקה נוספת לפני כל קריאה ל-`sortTableData`

#### פעולה 2.2: בידוד `updateFunction`
- עטוף את `updateFunction` ב-wrapper שמזהה רקורסיה
- הוסף timeout קצר לפני הפעלת `updateFunction` כדי למנוע קריאות כפולות

#### פעולה 2.3: בדיקת event listeners
- בדוק כמה event listeners יש על sortable headers
- הסר event listeners כפולים אם יש

#### פעולה 2.4: בדיקת `updateFunction` עצמו
- בדוק אם `updateTradingAccountsTable`, `renderPositionsTable`, `renderPortfolioTable` מפעילים מיון
- אם כן, הסר את הקריאות למיון מתוך `updateFunction`

### שלב 3: בדיקות מקיפות

#### פעולה 3.1: בדיקת מיון לכל טבלה בנפרד
- נסה למיין כל טבלה בנפרד
- זהה איזו טבלה גורמת לבעיה

#### פעולה 3.2: בדיקת `window.TABLE_COLUMN_MAPPINGS` בכל שלב
- בדוק את `window.TABLE_COLUMN_MAPPINGS` לאחר טעינת כל קובץ
- ודא שהוא לא נדחף/נערך על ידי קובץ אחר

#### פעולה 3.3: בדיקת console logs
- הפעל את כל הלוגים שהוספנו
- עקוב אחר סדר הטעינה והקריאות

---

## המלצות מיידיות

### פעולה מיידית #1: הוספת לוגים
הוסף לוגים ל-`table-mappings.js`, `tables.js`, `data-basic.js` כדי לראות מה קורה.

### פעולה מיידית #2: בדיקת console
פתח את ה-console של הדפדפן ובדוק אם יש שגיאות JavaScript.

### פעולה מיידית #3: בדיקת `package-manifest.js`
ודא ש-`table-mappings.js` מופיע ב-`ui-advanced` package עם `loadOrder: 0`.

### פעולה מיידית #4: בדיקת `updateFunction`
בדוק אם `updateTradingAccountsTable`, `renderPositionsTable`, `renderPortfolioTable` מפעילים מיון.

---

## סיכום

הבעיות העיקריות הן:
1. **רקורסיה אינסופית במיון** - כנראה בגלל `updateFunction` שמפעיל מיון נוסף או event listeners שמתעוררים מחדש
2. **`window.TABLE_COLUMN_MAPPINGS` לא נטען** - כנראה בגלל שגיאת JavaScript או בעיית סדר טעינה

הדרך הטובה ביותר להתחיל היא להוסיף לוגים מפורטים ולעקוב אחר סדר הטעינה והקריאות.

