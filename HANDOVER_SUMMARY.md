# סיכום מסירת פרויקט - TikTrack

## 📋 מצב נוכחי - 25 באוגוסט 2025

### 🎯 מה הושלם עד כה
- ✅ **מודול התראות (Alerts)** - הושלם במלואו
- ✅ **מודול עסקאות (Executions)** - הושלם במלואו (עודכן)
- ✅ **מודול טיקרים (Tickers)** - הושלם במלואו (עודכן)
- ✅ **מודול מטבעות (Currencies)** - הושלם במלואו (חדש)
- ✅ **מודול סוגי קישור (Note Relation Types)** - הושלם במלואו (חדש)
- ✅ **עמוד טבלאות עזר (DB Extra Data)** - הושלם במלואו (חדש)
- ✅ **מודול הערות (Notes)** - הושלם במלואו (חדש - 26 באוגוסט 2025)
- ✅ **מערכת Header** - עובדת
- ✅ **מערכת פילטרים** - עובדת
- ✅ **מערכת מיון** - עובדת
- ✅ **מערכת הודעות** - עובדת
- ✅ **מערכת מודלים** - עובדת עם z-index נכון
- ✅ **מערכת פורמט מספרים** - פונקציות גלובליות
- ✅ **מערכת צביעת סכומים** - פונקציות גלובליות
- ✅ **מערכת אזהרות מרכזית** - מערכת חדשה (עודכן)
- ✅ **מערכת מטבעות** - API ושירותים (עודכן)
- ✅ **בסיס נתונים** - 19 טבלאות, 13 התראות

### 🚧 מה נדרש להמשיך
- ⏳ **מודול טריידים (Trades)** - פשוט יותר להתחיל איתו
- ⏳ **מודול חשבונות (Accounts)** - פשוט יותר
- ⏳ **מודול תוכניות (Trade Plans)** - בינוני
- ⏳ **פילטרים ומיון לעמוד הערות** - להוסיף מערכת פילטרים מתקדמת

---

## 📁 מבנה קבצים עיקרי

### Backend (שרת Flask)
```
Backend/
├── app.py                    # נקודת כניסה ראשית
├── models/                   # מודלים של בסיס הנתונים
│   ├── alert.py             # מודל התראות - מוכן
│   ├── execution.py         # מודל עסקאות - מוכן (עודכן)
│   ├── trade.py             # מודל טריידים - פשוט
│   ├── account.py           # מודל חשבונות - פשוט
│   ├── ticker.py            # מודל טיקרים - פשוט
│   ├── currency.py          # מודל מטבעות - מוכן (חדש)
│   └── note_relation_type.py # מודל סוגי קישור - מוכן (חדש)
├── routes/api/              # API endpoints
│   ├── alerts.py            # התראות - מוכן
│   ├── executions.py        # עסקאות - מוכן (עודכן)
│   ├── trades.py            # טריידים - פשוט
│   ├── accounts.py          # חשבונות - פשוט
│   ├── tickers.py           # טיקרים - פשוט
│   ├── currencies.py        # מטבעות - מוכן (חדש)
│   ├── note_relation_types.py # סוגי קישור - מוכן (חדש)
│   └── notes.py             # הערות - מוכן (חדש - 26 באוגוסט 2025)
├── services/                # לוגיקה עסקית
│   ├── alert_service.py     # התראות - מוכן
│   └── validation_service.py # וולידציה - מוכן
└── db/
    └── simpleTrade_new.db   # בסיס נתונים - 19 טבלאות
```

### Frontend (ממשק משתמש)
```
trading-ui/
├── alerts.html              # דף התראות - מוכן
├── executions.html          # דף עסקאות - מוכן (עודכן)
├── db_extradata.html        # דף טבלאות עזר - מוכן (חדש)
├── trades.html              # דף טריידים - להתחיל איתו
├── accounts.html            # דף חשבונות - פשוט
├── tickers.html             # דף טיקרים - פשוט
├── scripts/
│   ├── alerts.js            # התראות - מוכן
│   ├── executions.js        # עסקאות - מוכן (עודכן)
│   ├── db-extradata.js      # טבלאות עזר - מוכן (חדש)
│   ├── trades.js            # טריידים - להתחיל איתו
│   ├── accounts.js          # חשבונות - פשוט
│   ├── tickers.js           # טיקרים - פשוט
│   ├── table-mappings.js    # מיפוי עמודות - מוכן
│   ├── translation-utils.js # פונקציות תרגום ופורמט - מוכן (עודכן)
│   ├── ui-utils.js          # כלים - מוכן
│   └── main.js              # פונקציות כלליות - מוכן
└── styles/
    ├── styles.css           # סגנונות כלליים - מוכן
    ├── table.css            # סגנונות טבלאות - מוכן
    ├── db-display.css       # סגנונות דף בסיס נתונים - מוכן (חדש)
    └── apple-theme.css      # ערכת נושא - מוכן
```

---

## 📋 רשימת משימות לפי סדר עדיפות

### 🟢 רמה 1 - פשוט (להתחיל איתו)
1. **מודול חשבונות (Accounts)**
   - קובץ: `trading-ui/accounts.html`
   - סקריפט: `trading-ui/scripts/accounts.js`
   - API: `Backend/routes/api/accounts.py`
   - מודל: `Backend/models/account.py`

2. **מודול טריידים (Trades)**
   - קובץ: `trading-ui/trades.html`
   - סקריפט: `trading-ui/scripts/trades.js`
   - API: `Backend/routes/api/trades.py`
   - מודל: `Backend/models/trade.py`

### 🟡 רמה 2 - בינוני
3. **מודול תוכניות (Trade Plans)**
   - קובץ: `trading-ui/trade_plans.html`
   - סקריפט: `trading-ui/scripts/trade_plans.js`

### ✅ רמה 0 - הושלם
4. **מודול עסקאות (Executions)** ✅ **הושלם**
   - קובץ: `trading-ui/executions.html`
   - סקריפט: `trading-ui/scripts/executions.js`

5. **מודול מטבעות (Currencies)** ✅ **הושלם (חדש)**
   - קובץ: `trading-ui/db_extradata.html` (חלק מטבלאות עזר)
   - סקריפט: `trading-ui/scripts/db-extradata.js`
   - API: `Backend/routes/api/currencies.py`
   - מודל: `Backend/models/currency.py`

6. **מודול סוגי קישור (Note Relation Types)** ✅ **הושלם (חדש)**
   - קובץ: `trading-ui/db_extradata.html` (חלק מטבלאות עזר)
   - סקריפט: `trading-ui/scripts/db-extradata.js`
   - API: `Backend/routes/api/note_relation_types.py`
   - מודל: `Backend/models/note_relation_type.py`

7. **עמוד טבלאות עזר (DB Extra Data)** ✅ **הושלם (חדש)**
   - קובץ: `trading-ui/db_extradata.html`
   - סקריפט: `trading-ui/scripts/db-extradata.js`
   - סגנונות: `trading-ui/styles/db-display.css`

---

## 🔧 כלים מוכנים לשימוש

### 1. מערכת מיפוי עמודות
```javascript
// קובץ: trading-ui/scripts/table-mappings.js
// פונקציות זמינות:
getColumnValue(item, columnIndex, tableType)
getTableMapping(tableType)
isTableSupported(tableType)
```

### 2. מערכת הודעות
```javascript
// קובץ: trading-ui/scripts/ui-utils.js
// פונקציות זמינות:
showNotification(message, type)
showModalNotification(type, title, message, modalId)
showErrorNotification(title, message)
showSuccessNotification(title, message)
```

### 3. מערכת פילטרים ומיון
```javascript
// קובץ: trading-ui/scripts/main.js
// פונקציות זמינות:
applyFilters()
sortTable(columnIndex, tableType)
updateTable(tableType, data)
```

### 4. מערכת Header
```javascript
// קובץ: trading-ui/scripts/header-system.js
// אוטומטי - לא צריך לגעת
```

### 5. מערכת פורמט מספרים (חדש - עודכן)
```javascript
// קובץ: trading-ui/scripts/translation-utils.js
// פונקציות זמינות:
window.formatNumberWithCommas(number, options)     // פורמט מספר עם פסיקים
window.formatCurrencyWithCommas(amount, currency)  // פורמט מטבע עם פסיקים
window.colorAmountByValue(amount, displayText, element) // צביעת סכום לפי ערך

// תאימות לאחור:
window.formatNumber = window.formatNumberWithCommas
window.formatCurrency = window.formatCurrencyWithCommas
window.colorAmount = window.colorAmountByValue
```

### 6. מערכת תרגום (חדש - עודכן)
```javascript
// קובץ: trading-ui/scripts/translation-utils.js
// פונקציות זמינות:
window.translateAccountStatus(status)
window.translateTickerStatus(status)
window.translateTradeType(type)
window.translateTradeStatus(status)
window.translateExecutionAction(action)
// ועוד פונקציות תרגום רבות...
```

### 7. מערכת אזהרות מרכזית (חדש - עודכן)
```javascript
// קובץ: trading-ui/scripts/warning-system.js
// קובץ: trading-ui/styles/warning-system.css
// פונקציות זמינות:
window.showWarning(type, data, options, onConfirm, onCancel)
window.showDeleteWarning(itemType, itemName, onConfirm, onCancel)
window.showLinkedItemsWarning(itemType, linkedCount, onConfirm, onCancel)
window.showValidationWarning(field, message)

// סוגי אזהרות:
// - DELETE: אזהרת מחיקה
// - LINKED_ITEMS: אזהרת פריטים מקושרים
// - VALIDATION: אזהרת ולידציה
// - SYSTEM: אזהרת מערכת
// - CONFIRMATION: אישור פעולה
```

### 8. מערכת מטבעות (חדש - עודכן)
```javascript
// קובץ: trading-ui/scripts/translation-utils.js
// פונקציות זמינות:
window.getCurrencyIcon(currencySymbol)           // אייקון מטבע
window.getTickerCurrencyDisplay(ticker)          // הצגת מטבע טיקר עם אייקון
window.getTickerCurrencySymbol(ticker)           // סמל מטבע בלבד
window.getCashFlowCurrencyDisplay(cashFlow)      // הצגת מטבע תזרים מזומנים

// API endpoints:
// GET /api/v1/currencies/ - כל המטבעות
// GET /api/v1/currencies/dropdown - מטבעות לדרופדאון
// POST /api/v1/currencies/ - יצירת מטבע
// PUT /api/v1/currencies/{id} - עדכון מטבע
// DELETE /api/v1/currencies/{id} - מחיקת מטבע
```

### 9. מערכת טבלאות עזר (חדש - הושלם)
```javascript
// קובץ: trading-ui/scripts/db-extradata.js
// פונקציות זמינות:

// פונקציות מטבעות:
window.addCurrencyRecord()                    // הוספת מטבע
window.editCurrencyRecord(id)                 // עריכת מטבע
window.deleteCurrencyRecord(id)               // מחיקת מטבע
window.saveCurrencyRecord()                   // שמירת מטבע
window.updateCurrencyRecord()                 // עדכון מטבע
window.confirmDeleteCurrencyRecord(id)        // אישור מחיקת מטבע

// פונקציות סוגי קישור:
window.addNoteRelationTypeRecord()            // הוספת סוג קישור
window.editNoteRelationTypeRecord(id)         // עריכת סוג קישור
window.deleteNoteRelationTypeRecord(id)       // מחיקת סוג קישור
window.saveNoteRelationTypeRecord()           // שמירת סוג קישור
window.updateNoteRelationTypeRecord()         // עדכון סוג קישור
window.confirmDeleteNoteRelationTypeRecord(id) // אישור מחיקת סוג קישור

// פונקציות וולידציה:
window.validateCurrencySymbol(input)          // וולידציה סמל מטבע
window.validateCurrencyName(input)            // וולידציה שם מטבע
window.validateCurrencyUsdRate(input)         // וולידציה שער דולר
window.validateCurrencyForm()                 // וולידציה כללית

// פונקציות סקשנים:
window.toggleAllSections()                    // פתיחה/סגירה כל הסקשנים
window.toggleCurrenciesSection()              // פתיחה/סגירה סקשן מטבעות
window.toggleNoteRelationTypesSection()       // פתיחה/סגירה סקשן סוגי קישור

// API endpoints:
// GET /api/v1/note_relation_types/ - כל סוגי הקישור
// POST /api/v1/note_relation_types/ - יצירת סוג קישור
// PUT /api/v1/note_relation_types/{id} - עדכון סוג קישור
// DELETE /api/v1/note_relation_types/{id} - מחיקת סוג קישור
```

### 10. מערכת אילוצים וולידציה (חדש - הושלם)
```javascript
// וולידציה בצד הלקוח:
// - תבנית regex: ^[A-Z]+$ (רק אותיות אנגליות גדולות)
// - אורך מקסימלי: 10 תווים
// - שדות חובה: symbol, name
// - מספר חיובי: usd_rate

// וולידציה בצד השרת:
// - בדיקת ייחודיות סמל מטבע
// - הודעות שגיאה ספציפיות בעברית
// - קודי שגיאה מתאימים (400, 404, 500)

// אילוצי בסיס נתונים:
// - symbol: VARCHAR(10) NOT NULL UNIQUE
// - name: VARCHAR(100) NOT NULL
// - usd_rate: NUMERIC(10,6) NOT NULL DEFAULT 1.000000
// - id: INTEGER NOT NULL PRIMARY KEY
// - created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
```

---

## 🎨 מערכת מודלים - למידות חשובות (חדש - עודכן)

### 1. Z-Index Management
```css
/* קובץ: trading-ui/styles/apple-theme.css */
.modal { z-index: 1050; }
.modal-backdrop { z-index: 1040; }
.notification { z-index: 1060; }
```

### 2. כפתורי סגירת מודלים
```css
/* כפתור סגירה במודל עם רקע צבעוני */
.modal-header-colored .btn-close {
    color: white;
    filter: brightness(0) invert(1);
}

/* כפתור סגירה במודל רגיל */
.modal-header:not(.modal-header-colored) .btn-close {
    color: #28a745;
}
```

### 3. מבנה כפתורי פעולה בטבלאות
```html
<!-- מבנה מומלץ לכפתורי פעולה -->
<td class="actions-cell">
    <table class="table table-sm table-borderless mb-0">
        <tbody>
            <tr>
                <td class="p-0 pe-1">
                    <button class="btn btn-sm btn-secondary" onclick="editItem(id)" title="ערוך">✏️</button>
                </td>
                <td class="p-0">
                    <button class="btn btn-sm btn-danger" onclick="deleteItem(id)" title="מחק">🗑️</button>
                </td>
            </tr>
        </tbody>
    </table>
</td>
```

---

## 📊 פונקציות כלליות חשובות (חדש - עודכן)

### 1. פונקציות תאריך
```javascript
// קובץ: trading-ui/scripts/main.js
window.formatDate(date)           // תאריך מלא
window.formatDateTime(date)       // תאריך ושעה
window.formatDateOnly(date)       // תאריך בלבד
```

### 2. פונקציות API
```javascript
// קובץ: trading-ui/scripts/data-utils.js
window.apiCall(url, method, data) // קריאה כללית ל-API
```

### 3. פונקציות טבלה
```javascript
// קובץ: trading-ui/scripts/tables.js
window.sortTableData(data, column, direction)
window.updateTableRowCount(tableType, count)
```

### 4. פונקציות מודלים
```javascript
// קובץ: trading-ui/scripts/ui-utils.js
window.showModal(modalId)
window.hideModal(modalId)
window.resetModalForm(modalId)
```

---

## 📋 שינויים אחרונים במודול טיקרים (חדש - עודכן)

### 1. עדכון אילוץ שם החברה
- **שינוי**: אורך שם החברה עודכן מ-12 ל-25 תווים
- **קבצים שעודכנו**:
  - `Backend/models/ticker.py`: `String(25), nullable=False`
  - `Backend/services/ticker_service.py`: `MAX_NAME_LENGTH: int = 25`
  - `trading-ui/scripts/tickers.js`: ולידציה ל-25 תווים
  - `Backend/migrations/update_ticker_name_length_to_25.py`: מיגרציה
- **בסיס נתונים**: טבלה עודכנה ל-`VARCHAR(25) NOT NULL`
- **אילוצים**: עודכן ל-`LENGTH(name) <= 25`

### 2. מערכת אזהרות מרכזית
- **קבצים חדשים**:
  - `trading-ui/scripts/warning-system.js`: מערכת האזהרות
  - `trading-ui/styles/warning-system.css`: עיצוב האזהרות
- **פונקציות זמינות**:
  - `showDeleteWarning()`: אזהרת מחיקה
  - `showLinkedItemsWarning()`: אזהרת פריטים מקושרים
  - `showValidationWarning()`: אזהרת ולידציה
- **שימוש**: החליף את המודלים הישנים של אזהרות

### 3. מערכת מטבעות משופרת
- **API endpoints**:
  - `/api/v1/currencies/dropdown`: מטבעות לדרופדאון
  - `/api/v1/currencies/`: ניהול מטבעות מלא
- **פונקציות JavaScript**:
  - `getTickerCurrencyDisplay()`: הצגת מטבע עם אייקון
  - `getTickerCurrencySymbol()`: סמל מטבע בלבד
  - `getCurrencyIcon()`: אייקון מטבע
- **דרופדאון**: טוען מטבעות מהשרת עם symbol ו-name

### 4. שיפורי UI/UX
- **עמודות טבלה**: סדר חדש - סמל, יש טריידים, סוג, מטבע, עודכן ב, שם, נוצר ב, הערות, פעולות
- **אייקון "יש טריידים"**: רקע ירוק/אדום עם 30% שקיפות
- **כותרת מודל**: כותרת וכפתור סגירה מחליפים צדדים
- **כפתור סגירה**: רקע לבן, טקסט כחול, מסגרת כתומה

### 5. שיפורי ולידציה
- **שם החברה**: 2-25 תווים במקום 2-12
- **מטבע**: חובה לבחור מטבע מהרשימה
- **סמל**: עדיין 10 תווים מקסימום
- **סוג**: חובה לבחור סוג מהרשימה

## 🚨 בעיות נפוצות ופתרונות (חדש - עודכן)

### 1. מודלים נפתחים מאחורי הרקע
**בעיה**: Z-index לא נכון
**פתרון**: וודא שהמודל יש לו `z-index: 1050` והרקע `z-index: 1040`

### 2. פונקציות לא מוגדרות
**בעיה**: פונקציה לא מיוצאת ל-window
**פתרון**: הוסף `window.functionName = functionName` בסוף הקובץ

### 3. נתונים לא נטענים
**בעיה**: API מחזיר שגיאה
**פתרון**: בדוק את הקונסול ובדוק שהשרת רץ

### 4. פורמט מספרים לא עובד
**בעיה**: לא משתמש בפונקציות החדשות
**פתרון**: השתמש ב-`window.formatNumberWithCommas` במקום `toFixed()`

### 5. כפתורי פעולה לא מיושרים
**בעיה**: מבנה flex לא עובד במסכים צרים
**פתרון**: השתמש במבנה טבלה קטנה לכפתורים

---

## 📖 קבצי דוקומנטציה רלוונטיים

### 1. רשימת בדיקות מודולים
- **קובץ**: `MODULE_TESTING_CHECKLIST.md`
- **תוכן**: רשימת משימות מפורטת לכל מודול
- **סטטוס**: התראות - ✅ מוכן, עסקאות - ✅ מוכן, השאר - ⏳ ממתין

### 2. ארכיטקטורת JavaScript
- **קובץ**: `JAVASCRIPT_SCRIPTS_ARCHITECTURE.md`
- **תוכן**: הסבר על מבנה הקבצים ותלויות
- **חשיבות**: קריטי להבנת המערכת

### 3. מיפוי פונקציות JavaScript
- **קובץ**: `JAVASCRIPT_FUNCTIONS_MAPPING.md`
- **תוכן**: רשימת כל הפונקציות ואיפה הן נמצאות
- **חשיבות**: עזרה במציאת פונקציות קיימות

### 4. סטטוס פרויקט
- **קובץ**: `PROJECT_STATUS_SUMMARY.md`
- **תוכן**: סקירה כללית של מצב הפרויקט
- **חשיבות**: הבנת התמונה הגדולה

### 5. מדריך אילוצי בסיס נתונים
- **קובץ**: `DATABASE_CONSTRAINTS_IMPLEMENTATION_GUIDE.md`
- **תוכן**: הסבר על אילוצי בסיס הנתונים
- **חשיבות**: הבנת מבנה הנתונים

---

## 🚀 הוראות התחלה מהירה

### 1. הפעלת השרת
```bash
cd Backend
python app.py
```

### 2. פתיחת האתר
```
http://localhost:8080
```

### 3. התחלה עם מודול פשוט
1. פתח `trading-ui/accounts.html`
2. בדוק את `trading-ui/scripts/accounts.js`
3. השתמש במודל התראות או עסקאות כדוגמה

### 4. שימוש בכלים מוכנים
```javascript
// מיפוי עמודות
const value = getColumnValue(item, 0, 'accounts');

// הצגת הודעה
showNotification('חשבון נשמר בהצלחה', 'success');

// עדכון טבלה
updateTable('accounts', accountsData);

// פורמט מספרים
const formattedNumber = window.formatNumberWithCommas(1234567);
const formattedCurrency = window.formatCurrencyWithCommas(1234.56);

// צביעת סכום
const coloredAmount = window.colorAmountByValue(1234.56, '$1,234.56');

// מערכת אזהרות
window.showDeleteWarning('חשבון', 'חשבון טכנולוגיה', 
    () => deleteAccount(id), 
    () => console.log('מחיקה בוטלה')
);

// מערכת מטבעות
const currencyDisplay = window.getTickerCurrencyDisplay(ticker);
const currencySymbol = window.getTickerCurrencySymbol(ticker);
const currencyIcon = window.getCurrencyIcon('USD');
```

---

## 🔍 דוגמה למודול פשוט - חשבונות

### מבנה הטבלה (Accounts)
```sql
CREATE TABLE accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    currency VARCHAR(10) DEFAULT 'ILS',
    cash_balance DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### עמודות בטבלה
1. מזהה (id)
2. שם (name)
3. מטבע (currency)
4. יתרה במזומן (cash_balance)
5. סטטוס (status)
6. נוצר ב (created_at)
7. פעולות (actions)

### מיפוי עמודות
```javascript
// ב-table-mappings.js
'accounts': [
    'id',              // 0 - מזהה
    'name',            // 1 - שם
    'currency',        // 2 - מטבע
    'cash_balance',    // 3 - יתרה
    'status',          // 4 - סטטוס
    'created_at'       // 5 - נוצר ב
]
```

## 🔍 דוגמה למודול מורכב - טיקרים (הושלם)

### מבנה הטבלה (Tickers)
```sql
CREATE TABLE tickers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(25) NOT NULL,
    type VARCHAR(20) NOT NULL,
    currency_id INTEGER NOT NULL,
    remarks TEXT,
    active_trades BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (currency_id) REFERENCES currencies(id)
);
```

### עמודות בטבלה
1. סמל (symbol)
2. יש טריידים (active_trades)
3. סוג (type)
4. מטבע (currency)
5. עודכן ב (updated_at)
6. שם (name)
7. נוצר ב (created_at)
8. הערות (remarks)
9. פעולות (actions)

### מיפוי עמודות
```javascript
// ב-table-mappings.js
'tickers': [
    'symbol',          // 0 - סמל
    'active_trades',   // 1 - יש טריידים
    'type',            // 2 - סוג
    'currency',        // 3 - מטבע
    'updated_at',      // 4 - עודכן ב
    'name',            // 5 - שם
    'created_at',      // 6 - נוצר ב
    'remarks'          // 7 - הערות
]
```

### שימוש במערכת האזהרות
```javascript
// מחיקת טיקר
function deleteTicker(id) {
    window.showDeleteWarning('טיקר', ticker.symbol, 
        () => confirmDeleteTicker(id),
        () => console.log('מחיקה בוטלה')
    );
}

// טעינת מטבעות
async function loadTickersData() {
    await loadCurrenciesFromServer(); // טוען מטבעות מהשרת
    // ... טעינת טיקרים
}
```

---

## ⚠️ דברים חשובים לזכור

### 1. סדר טעינת קבצים
- הקבצים נטענים לפי הסדר ב-HTML
- `translation-utils.js` חייב להיטען לפני כל הסקריפטים האחרים
- `ui-utils.js` חייב להיטען לפני כל הסקריפטים האחרים
- `table-mappings.js` חייב להיטען לפני `main.js`

### 2. שמות פונקציות
- כל הפונקציות מיוצאות ל-`window`
- השתמש ב-`window.functionName` או פשוט `functionName`
- בדוק ב-`JAVASCRIPT_FUNCTIONS_MAPPING.md` אם פונקציה קיימת

### 3. מבנה נתונים
- כל הנתונים מגיעים מ-API בפורמט: `{status: 'success', data: [...]}`
- השתמש ב-`response.data` לגישה לנתונים
- בדוק אילוצי בסיס נתונים ב-`DATABASE_CONSTRAINTS_IMPLEMENTATION_GUIDE.md`

### 4. עיצוב
- השתמש בסגנונות קיימים מ-`styles.css`
- עקוב אחרי התבנית של מודול התראות או עסקאות
- השתמש ב-`apple-theme.css` לעיצוב עקבי

### 5. פורמט מספרים (חדש - עודכן)
- השתמש תמיד ב-`window.formatNumberWithCommas` למספרים
- השתמש תמיד ב-`window.formatCurrencyWithCommas` לסכומי כסף
- השתמש תמיד ב-`window.colorAmountByValue` לצביעת סכומים

### 6. מודלים (חדש - עודכן)
- וודא שלכל מודל יש `data-bs-backdrop="static"`
- וודא שכפתורי הסגירה מיושרים נכון
- השתמש במבנה טבלה לכפתורי פעולה

### 7. מערכת אזהרות (חדש - עודכן)
- השתמש ב-`window.showDeleteWarning()` לאזהרות מחיקה
- השתמש ב-`window.showLinkedItemsWarning()` לאזהרות פריטים מקושרים
- השתמש ב-`window.showValidationWarning()` לאזהרות ולידציה
- הוסף `<link rel="stylesheet" href="styles/warning-system.css">` ל-HTML
- הוסף `<script src="scripts/warning-system.js"></script>` ל-HTML

### 8. מערכת מטבעות (חדש - עודכן)
- השתמש ב-`window.getTickerCurrencyDisplay(ticker)` להצגת מטבע עם אייקון
- השתמש ב-`window.getTickerCurrencySymbol(ticker)` לסמל מטבע בלבד
- השתמש ב-`window.getCurrencyIcon(symbol)` לאייקון מטבע
- טען מטבעות עם `loadCurrenciesFromServer()` בתחילת הדף

### 9. מערכת טבלאות עזר (חדש - הושלם)
- השתמש ב-`window.addCurrencyRecord()` להוספת מטבע
- השתמש ב-`window.addNoteRelationTypeRecord()` להוספת סוג קישור
- השתמש ב-`window.validateCurrencySymbol(input)` לוולידציה
- השתמש ב-`window.toggleAllSections()` לפתיחה/סגירה כל הסקשנים
- הוסף `<link rel="stylesheet" href="styles/db-display.css">` ל-HTML
- הוסף `<script src="scripts/db-extradata.js"></script>` ל-HTML

### 10. מערכת אילוצים וולידציה (חדש - הושלם)
- וולידציה בצד הלקוח עם תבנית regex: `^[A-Z]+$`
- וולידציה בצד השרת עם הודעות שגיאה בעברית
- אילוצי בסיס נתונים: UNIQUE, NOT NULL, DEFAULT
- הודעות שגיאה ספציפיות לכל שדה
- צבעי שדות (ירוק לתקין, אדום לשגוי)

### 11. עיצוב כפתורים במודלים (חדש - הושלם)
- כפתורי שמירה: רקע לבן, מסגרת ירוקה, גודל קבוע
- כפתורי ביטול: רקע לבן, מסגרת אפורה, גודל קבוע
- כפתורי מחיקה: רקע לבן, מסגרת אדומה, גודל קבוע
- סגנונות מיוחדים למודלים ב-`db-display.css`

### 12. אילוצי טבלאות דינמיים (חדש - הושלם)
- הצגת אילוצי טבלאות מתחת לכל טבלה
- סוגי אילוצים: constraint, unique, default, index, format
- צבעים ואייקונים לכל סוג אילוץ
- עיצוב אחיד עם `table.css`

---

## 📞 תמיכה

### קבצי גיבוי
- **גיבוי מלא**: `backups/20250825_020915_alerts_module_complete/`
- **README גיבוי**: `backups/20250825_020915_alerts_module_complete/README_BACKUP.md`
- **סיכום גיבוי**: `backup_summary_20250825_020915.txt`

### קבצי לוג
- **לוגים**: `Backend/logs/`
- **לוגים**: `logs/`

### תיעוד נוסף
- **תיעוד מלא**: `documentation/`
- **דוגמאות**: `documentation/examples/`

---

**נוצר על ידי**: TikTrack Development Team  
**תאריך**: 25 באוגוסט 2025  
**עודכן על ידי**: Assistant (עבודה על מודול טבלאות עזר)  
**תאריך עדכון**: 25 באוגוסט 2025  
**מטרה**: מסירת פרויקט למישהו אחר  
**סטטוס**: מוכן להמשך עבודה
