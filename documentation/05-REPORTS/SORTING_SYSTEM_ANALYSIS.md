# ניתוח מערכת הסידור - Cash Flows vs Executions

## תאריך: 2025-01-27

---

## הבעיה שזוהתה

המערכת משתמשת בשתי פונקציות `getColumnValue`:
1. **`table-mappings.js`** - מיפוי מדויק עם טיפול בשדות מחושבים ✅
2. **`tables.js`** - fallback mapping ישן שלא תואם למיפוי האמיתי ❌

### הבעיה העיקרית

ב-`tables.js`, הפונקציה `getColumnValue` בודקת:
1. קודם את `window.TABLE_COLUMN_MAPPINGS` (אבל בלי טיפול בשדות מחושבים)
2. אם לא מוצא - נופלת ל-fallback mapping ישן

**המיפוי הישן ב-executions:**
```javascript
'executions': [
  'id', 'symbol', 'side', 'investment_type', 'status', 'account_name', 'created_at', 'amount',
],
```

**המיפוי הנכון ב-table-mappings.js:**
```javascript
'executions': [
  'ticker_symbol',         // 0 - טיקר
  'action',                // 1 - פעולה
  'account_name',          // 2 - חשבון מסחר
  'quantity',              // 3 - כמות
  'price',                 // 4 - מחיר
  'pl',                    // 5 - P&L
  'realized_pl',           // 6 - Realized P/L
  'mtm_pl',                // 7 - MTM P/L
  'date',                  // 8 - תאריך
  'source',                // 9 - מקור
],
```

### למה Cash Flows עובד?

ב-`cash_flows`, המיפוי ב-fallback ב-`tables.js` תואם למיפוי הנכון:
```javascript
'cash_flows': [
  'account_name',  // 0 - חשבון מסחר
  'type',          // 1 - סוג
  'amount',        // 2 - סכום
  'date',          // 3 - תאריך
  'description',   // 4 - תיאור
  'source',        // 5 - מקור
],
```

לכן הוא עובד גם עם fallback.

### למה Executions לא עובד?

1. **המיפוי הישן לא תואם** - `executions` ב-fallback שונה לגמרי מהמיפוי הנכון
2. **אין טיפול בשדות מחושבים** - `ticker_symbol` צריך טיפול מיוחד (מחושב מ-ticker/ticker_id)
3. **הפונקציה ב-tables.js לא משתמשת ב-getColumnValue מ-table-mappings.js** - שהיא המקור הסמכותי

---

## התיקון שבוצע

### שינוי ב-`tables.js`:

**לפני:**
```javascript
// Try to use TABLE_COLUMN_MAPPINGS from table-mappings.js first
if (window.TABLE_COLUMN_MAPPINGS && window.TABLE_COLUMN_MAPPINGS[tableType]) {
  const mapping = window.TABLE_COLUMN_MAPPINGS[tableType];
  const fieldName = mapping[columnIndex];
  if (fieldName) {
    return item[fieldName] || ''; // ❌ לא מטפל בשדות מחושבים!
  }
}
// Fallback mapping...
```

**אחרי:**
```javascript
// Try to use getColumnValue from table-mappings.js if available
// This is the authoritative source for column value extraction
if (window.tableMappings && typeof window.tableMappings.getColumnValue === 'function') {
  return window.tableMappings.getColumnValue(item, columnIndex, tableType); // ✅
}

// Fallback only if table-mappings.js not loaded
console.warn(`⚠️ table-mappings.js getColumnValue not available...`);
// Fallback mapping...
```

---

## בדיקות נדרשות

### 1. כל העמודות פעילות לסידור
- ✅ cash_flows - עובד
- ❓ executions - צריך לבדוק אחרי התיקון

### 2. כל עמודה מסדרת לפי התוכן שלה
- ✅ cash_flows - עובד
- ❓ executions - צריך לבדוק אחרי התיקון

### 3. כל פעולה משפיעה על כל הרשומות
- ✅ cash_flows - עובד
- ❓ executions - צריך לבדוק (אם רק חלק מהרשומות מושפעות, זה יכול להיות בעיה ב-updateExecutionsTableMain)

### 4. לחיצה שנייה הופכת את הסדר
- ✅ cash_flows - עובד
- ❓ executions - צריך לבדוק אחרי התיקון

---

## סיכום

**הבעיה היא במיפוי, לא בקוד הסידור עצמו.**

התיקון:
1. ✅ שינוי `tables.js` להשתמש ב-`getColumnValue` מ-`table-mappings.js`
2. ✅ זה יבטיח שכל הטבלאות משתמשות במיפוי הנכון עם טיפול בשדות מחושבים

**השלב הבא:** בדיקה בפועל של executions אחרי התיקון.

