# בדיקה מקיפה - מיפוי טבלאות מול Fallback

## תאריך: 2025-01-27

---

## בעיה שזוהתה

ב-`tables.js` יש fallback mapping ישן שלא תואם למיפוי הנכון ב-`table-mappings.js`.

### הבעיה העיקרית

הפונקציה `getColumnValue` ב-`tables.js` בודקת בסדר שגוי:
1. ❌ קודם בודקת `window.TABLE_COLUMN_MAPPINGS` ישירות (ללא טיפול בשדות מחושבים)
2. ✅ רק אחר כך בודקת `window.tableMappings.getColumnValue` (עם טיפול בשדות מחושבים)

**זה אומר שהפונקציה לא מגיעה ל-getColumnValue הנכון!**

---

## השוואת מיפויים

### 1. Executions ❌ **לא תואם**

**Fallback (tables.js):**
```javascript
'executions': [
  'id', 'symbol', 'side', 'investment_type', 'status', 'account_name', 'created_at', 'amount',
]
```

**נכון (table-mappings.js):**
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
]
```

**סטטוס:** ❌ **לא תואם - כל העמודות שונות!**

---

### 2. Trades ❌ **לא תואם**

**Fallback (tables.js):**
```javascript
'trades': [
  'id', 'symbol', 'side', 'investment_type', 'status', 'account_name', 'created_at', 'amount',
]
```

**נכון (table-mappings.js):**
```javascript
'trades': [
  'ticker_symbol',         // 0 - טיקר
  'current_price',         // 1 - מחיר (מחושב)
  'daily_change',          // 2 - שינוי (מחושב)
  'position_quantity',     // 3 - פוזיציה (מחושב)
  'position_pl_percent',   // 4 - P/L% (מחושב)
  'position_pl_value',     // 5 - P/L (מחושב)
  'status',                // 6 - סטטוס
  'investment_type',       // 7 - סוג
  'side',                  // 8 - צד
  'trade_plan_id',         // 9 - תוכנית
  'account_name',          // 10 - חשבון מסחר
  'created_at',            // 11 - נוצר ב
  'closed_at',             // 12 - נסגר ב
]
```

**סטטוס:** ❌ **לא תואם - כל העמודות שונות!**

---

### 3. Trade Plans ❌ **לא תואם**

**Fallback (tables.js):**
```javascript
'trade_plans': [
  'id', 'symbol', 'side', 'investment_type', 'status', 'target_price', 'stop_loss', 'created_at',
]
```

**נכון (table-mappings.js):**
```javascript
'trade_plans': [
  'ticker_symbol',         // 0 - טיקר (מחושב)
  'created_at',            // 1 - תאריך
  'investment_type',       // 2 - סוג
  'side',                  // 3 - צד
  'quantity',              // 4 - כמות (מחושב)
  'target_price',          // 5 - מחיר
  'planned_amount',        // 6 - השקעה
  'status',                // 7 - סטטוס
  'reward',                // 8 - סיכוי (מחושב)
  'risk',                  // 9 - סיכון (מחושב)
  'ratio',                 // 10 - יחס (מחושב)
]
```

**סטטוס:** ❌ **לא תואם - כל העמודות שונות!**

---

### 4. Tickers ❌ **לא תואם**

**Fallback (tables.js):**
```javascript
'tickers': [
  'symbol', 'status', 'active_trades', 'current_price', 'change_percent', 'type', 'name', 'remarks', 'yahoo_updated_at',
]
```

**נכון (table-mappings.js):**
```javascript
'tickers': [
  'symbol',                // 0 - שם הטיקר (symbol)
  'current_price',         // 1 - מחיר נוכחי
  'change_percent',        // 2 - שינוי יומי
  'volume',                // 3 - נפח
  'status',                // 4 - סטטוס
  'type',                  // 5 - סוג
  'name',                  // 6 - שם החברה
  'currency_id',           // 7 - מטבע
  'yahoo_updated_at',      // 8 - עודכן ב
]
```

**סטטוס:** ❌ **לא תואם - סדר שונה!**

---

### 5. Accounts ❌ **לא תואם**

**Fallback (tables.js):**
```javascript
'accounts': [
  'id', 'name', 'currency_name', 'balance', 'status', 'created_at',
]
```

**נכון (table-mappings.js):**
```javascript
'accounts': [
  'name',                  // 0 - שם החשבון מסחר
  'currency_id',           // 1 - מטבע
  'cash_balance',          // 2 - יתרה (מחושב)
  'positions_count',       // 3 - פוזיציות (מחושב)
  'total_pl',              // 4 - רווח/הפסד
  'status',                // 5 - סטטוס
]
```

**סטטוס:** ❌ **לא תואם - כל העמודות שונות!**

---

### 6. Alerts ❌ **לא תואם**

**Fallback (tables.js):**
```javascript
'alerts': [
  'id', 'title', 'status', 'related_type_id', 'condition', 'message', 'created_at', 'is_triggered',
]
```

**נכון (table-mappings.js):**
```javascript
'alerts': [
  'related_object',        // 0 - קשור ל (מחושב)
  'ticker_symbol',         // 1 - טיקר (מחושב)
  'condition',             // 2 - תנאי (מחושב)
  'status',                // 3 - סטטוס
  'is_triggered',          // 4 - הופעל
  'condition_source',      // 5 - תנאי (מקור)
  'created_at',            // 6 - נוצר ב
  'expiry_date',           // 7 - תאריך תפוגה
]
```

**סטטוס:** ❌ **לא תואם - כל העמודות שונות!**

---

### 7. Notes ❌ **לא תואם**

**Fallback (tables.js):**
```javascript
'notes': [
  'id', 'title', 'content', 'type', 'status', 'created_at',
]
```

**נכון (table-mappings.js):**
```javascript
'notes': [
  'related_object',        // 0 - קשור ל (מחושב)
  'content',               // 1 - תוכן
  'created_at',            // 2 - נוצר ב
  'attachment',            // 3 - קובץ מצורף
]
```

**סטטוס:** ❌ **לא תואם - כל העמודות שונות!**

---

### 8. Cash Flows ✅ **תואם**

**Fallback (tables.js):**
```javascript
'cash_flows': [
  'account_name',  // 0 - חשבון מסחר
  'type',          // 1 - סוג
  'amount',        // 2 - סכום
  'date',          // 3 - תאריך
  'description',   // 4 - תיאור
  'source',        // 5 - מקור
]
```

**נכון (table-mappings.js):**
```javascript
'cash_flows': [
  'account_name',          // 0 - חשבון מסחר
  'type',                  // 1 - סוג
  'amount',                // 2 - סכום
  'date',                  // 3 - תאריך
  'description',           // 4 - תיאור
  'source',                // 5 - מקור
]
```

**סטטוס:** ✅ **תואם - זה למה זה עובד!**

---

## סיכום

### טבלאות עם בעיות (7):
1. ❌ `executions` - לא תואם
2. ❌ `trades` - לא תואם
3. ❌ `trade_plans` - לא תואם
4. ❌ `tickers` - לא תואם
5. ❌ `accounts` - לא תואם
6. ❌ `alerts` - לא תואם
7. ❌ `notes` - לא תואם

### טבלאות ללא בעיות (1):
1. ✅ `cash_flows` - תואם

---

## התיקון שבוצע

### שינוי הסדר ב-`tables.js`:

**לפני:**
```javascript
// 1. בודק window.TABLE_COLUMN_MAPPINGS ישירות (ללא טיפול בשדות מחושבים)
// 2. רק אחר כך בודק window.tableMappings.getColumnValue
```

**אחרי:**
```javascript
// 1. קודם בודק window.tableMappings.getColumnValue (עם טיפול בשדות מחושבים)
// 2. רק אם זה לא זמין - בודק window.TABLE_COLUMN_MAPPINGS ישירות
```

---

## תוצאה

עכשיו כל הטבלאות ישתמשו ב-`getColumnValue` הנכון מ-`table-mappings.js` עם טיפול נכון בשדות מחושבים!

**כל הטבלאות צריכות לעבוד נכון עכשיו!** ✅

